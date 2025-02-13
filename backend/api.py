import logging
import os
import shutil
from collections import defaultdict
from concurrent.futures import ThreadPoolExecutor
from typing import List

from fastapi import FastAPI, status, Depends, WebSocket, WebSocketDisconnect, UploadFile, File
from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse
from requests import Request
from sqlalchemy.orm import Session

from backend.config.config import api_key, file_dir
from backend.entity.connection import get_session
from backend.entity.models import serialize_model
from backend.model.attachment_model import AttachmentModel
from backend.model.message_model import MessageModel
from backend.model.session_model import SessionModel
from backend.model.user_model import UserModel
from backend.repo.attachment_repo import save_attachment, get_attachments, update_attachment, delete_attachments, \
    get_attachments_by_message_ids
from backend.repo.message_repo import get_messages, save_message
from backend.repo.session_repo import get_sessions, save_session, update_session
from backend.service.llm_helper import LLMHelper
from backend.util.common import now_str

logging.basicConfig(level=logging.WARNING)

DEFAULT_TITLE = 'untitled'
DEFAULT_USER = 'unknown'
UPLOAD_DIR = os.path.expanduser(file_dir())

if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)

API_KEY = api_key()

llm_helper = LLMHelper()

executor = ThreadPoolExecutor(max_workers=4)

app = FastAPI()

unauthorized_res = JSONResponse(
    status_code=status.HTTP_401_UNAUTHORIZED,
    content={"detail": "Unauthorized"},
    headers={"WWW-Authenticate": "Bearer"})


@app.middleware("http")
async def check_authorization(request: Request, call_next):
    if request.url.path != "/login":
        auth_header = request.headers.get("api-key")
        if not auth_header or auth_header != API_KEY:
            return unauthorized_res

    response = await call_next(request)
    return response


@app.post("/login")
async def login(data: UserModel):
    data_dict = jsonable_encoder(data)
    if data_dict['password'] != API_KEY:
        return unauthorized_res
    return {'status': True}


@app.post("/messages")
async def messages(data: List[SessionModel], db: Session = Depends(get_session)):
    _messages = get_messages(db, session_ids=[item.id for item in data])
    _messages = [MessageModel(**serialize_model(item)) for item in _messages]
    attachments = get_attachments_by_message_ids(db, [str(item.id) for item in _messages])
    attachments_by_message = defaultdict(list)
    for attachment in attachments:
        attachments_by_message[str(attachment.message_id)].append(AttachmentModel(**serialize_model(attachment)))
    messages_by_session = defaultdict(list)
    for _message in _messages:
        _message.attachments = attachments_by_message.get(str(_message.id))
        messages_by_session[str(_message.session_id)].append(_message)
    llm_helper.init_session_history(messages_by_session)
    return _messages


@app.get("/sessions")
async def sessions(db: Session = Depends(get_session)):
    user_id = DEFAULT_USER
    session_list = get_sessions(db, user_id=user_id)
    if len(session_list) == 0:
        session = save_session(db, SessionModel(title=DEFAULT_TITLE, user_id=user_id))
        session_list = [session]
    return session_list


@app.get("/session")
async def sessions(session_id: str, db: Session = Depends(get_session)):
    llm_helper.clean_session_history(session_id)
    return {'status': True}


@app.post("/session")
async def sessions(data: SessionModel, db: Session = Depends(get_session)):
    if not data.user_id:
        data.user_id = DEFAULT_USER
    if not data.title:
        data.title = DEFAULT_TITLE
    return save_session(db, data)


@app.put("/session")
async def sessions(data: SessionModel, db: Session = Depends(get_session)):
    if not data.id:
        return {}
    return update_session(db, data, ['title', 'status'])


@app.post("/completions")
async def completions(data: MessageModel, db: Session = Depends(get_session)):
    if not data.type:
        data.type = "user"
    save_message(db, data)
    response = llm_helper.completions(message=data.content, session_id=data.session_id)
    message = MessageModel(content=response, session_id=data.session_id, type="system")
    return save_message(db, message)


@app.post("/upload")
async def upload_files(session_id: str, files: List[UploadFile] = File(...), db: Session = Depends(get_session)):
    results = []
    file_paths = []
    file_folder = os.path.join(UPLOAD_DIR, session_id)
    if not os.path.exists(file_folder):
        os.makedirs(file_folder)

    for file in files:
        file_loc = os.path.join(file_folder, file.filename)
        file_paths.append(file_loc)
        with open(file_loc, "wb") as buffer:
            # noinspection PyTypeChecker
            shutil.copyfileobj(file.file, buffer)

        attachment = AttachmentModel(file_name=file.filename, file_size=file.size, session_id=session_id)
        delete_attachments(db, session_id, file.filename)
        result = save_attachment(db, attachment)
        results.append(result)

    def update_previews(_db, _session_id, _file_paths: List[str]):
        _docs = llm_helper.append_docs(_file_paths)
        for _doc in _docs:
            update_attachment(_db,
                              preview=_doc.page_content[:4000],
                              session_id=_session_id,
                              file_name=_doc.metadata["filename"])

    executor.submit(update_previews, db, session_id, file_paths)

    return results


@app.websocket("/ws/stream")
async def websocket_stream(websocket: WebSocket, db: Session = Depends(get_session)):
    await websocket.accept()

    def build_response(_data: MessageModel):
        return {
            'id': _data.id,
            'session_id': _data.session_id,
            'content': '',
            'type': 'system',
            'created_at': now_str(),
            'status': 'pending'
        }

    async def ws_send_message(_websocket: WebSocket, _data: MessageModel):
        _response = build_response(_data)
        _files = defaultdict(str)
        for item in _data.attachments:
            _files[item.file_name] = item.preview
        try:
            async for chunk in llm_helper.streaming(_data.content, _data.session_id, files=_files):
                _response['content'] += chunk
                await _websocket.send_json(_response)
            _response['status'] = 'completed'
            _response['created_at'] = now_str()
            await _websocket.send_json(_response)
            return _response
        except WebSocketDisconnect:
            print('[/ws/stream] - send msg disconnected')
            _response['created_at'] = now_str()
            if _response.get('content') == '':
                _response['content'] = 'No Response.'
            return _response

    while True:
        try:
            data = await websocket.receive_json()
            if not data.get('type'):
                data['type'] = 'user'
            save_message(db, MessageModel(**data))
            data['id'] = data.get('answer_id')
            attachment_ids = [item.get('id') for item in data.get('attachments', [])]
            message_model = MessageModel(**data)
            message_model.attachments = get_attachments(db, attachment_ids)
            response = await ws_send_message(websocket, message_model)
            save_message(db, MessageModel(**response))
        except WebSocketDisconnect:
            print('[/ws/stream] - receive msg disconnected')
        except RuntimeError as e:
            print(f"[/ws/stream] - receive msg disconnected, {e}")
            break
