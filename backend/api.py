import asyncio
import binascii
import logging
import os
import shutil
import threading
from collections import defaultdict
from concurrent.futures import ThreadPoolExecutor
from contextlib import asynccontextmanager
from typing import List

from fastapi import FastAPI, status, Depends, WebSocket, WebSocketDisconnect, UploadFile, File, Request
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from starlette.middleware.sessions import SessionMiddleware

from backend.config.config import api_key, file_dir
from backend.entity.connection import get_session, SessionLocal
from backend.entity.entity import serialize
from backend.mapper.mapper import website_to_model, rag_to_model, rag_to_models
from backend.model.attachment_model import AttachmentModel
from backend.model.message_model import MessageModel
from backend.model.rag_model import RagModel
from backend.model.session_model import SessionModel
from backend.model.user_model import UserModel
from backend.model.website_model import WebsiteModel
from backend.repo.attachment_repo import save_attachment, get_attachments, update_attachment, delete_attachments, \
    get_attachments_by_message_ids, get_attachments_by_session_id
from backend.repo.message_repo import get_messages, save_message
from backend.repo.rag_repo import save_rag, get_rags, update_rag, delete_rag, get_rag
from backend.repo.session_repo import get_sessions, save_session, update_session
from backend.repo.user_repo import save_user, validate_user, parse_user
from backend.repo.website_repo import get_websites, save_website, update_website, delete_websites, get_website
from backend.service import scheduler
from backend.service.llm_helper import LLMHelper, parse_docs
from backend.service.proxy import common_proxy, parse_get_proxy
from backend.util.common import now_str, is_alphanumeric, is_valid_email

logging.basicConfig(level=logging.WARNING)

DEFAULT_TITLE = 'untitled'
DEFAULT_USER = UserModel(id='unknown', username='', password='')
UPLOAD_DIR = os.path.expanduser(file_dir())

if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)

API_KEY = api_key()

llm_helper = LLMHelper()

executor = ThreadPoolExecutor(max_workers=4)

file_queue = defaultdict(list)
lock = threading.Lock()


@asynccontextmanager
async def lifespan(_app: FastAPI):
    asyncio.create_task(scheduler.execute())
    yield


app = FastAPI(lifespan=lifespan)
app.add_middleware(SessionMiddleware, secret_key=API_KEY)

unauthorized_res = JSONResponse(
    status_code=status.HTTP_401_UNAUTHORIZED,
    content={"detail": "Unauthorized"},
    headers={"WWW-Authenticate": "Bearer"})


def get_user(request: Request) -> UserModel:
    return request.state.user if hasattr(request.state, "user") else DEFAULT_USER


@app.middleware("http")
async def check_authorization(request: Request, call_next):
    db = SessionLocal()
    if request.url.path not in ["/login", "/register"]:
        auth_token = request.cookies.get("token")
        if not auth_token:
            return unauthorized_res
        try:
            user = parse_user(auth_token)
            if not validate_user(db, user):
                return unauthorized_res
            request.state.user = user
        except UnicodeDecodeError:
            return unauthorized_res
        except binascii.Error:
            return unauthorized_res
        except RuntimeError:
            return unauthorized_res

    response = await call_next(request)
    db.close()
    return response


@app.post("/login")
async def login(user: UserModel, db: Session = Depends(get_session)):
    user_token = validate_user(db, user)
    return {'token': user_token} if user_token else unauthorized_res


@app.post("/register")
async def register(user: UserModel, db: Session = Depends(get_session)):
    def build_bad_request(detail: str):
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"detail": detail}
        )

    if not is_alphanumeric(user.username):
        return build_bad_request("Invalid username")

    if not is_valid_email(user.email):
        return build_bad_request("Invalid email")

    return UserModel(**serialize(save_user(db, user)))


@app.post("/proxy")
async def proxy(request: Request):
    body = await request.json()
    target_url = body.get('url')
    if not target_url:
        return {"error": "No target URL provided"}

    return await common_proxy(body, target_url)


@app.post("/messages")
async def get_messages_api(data: List[SessionModel], db: Session = Depends(get_session)):
    _messages = get_messages(db, session_ids=[item.id for item in data], limit=20, offset=now_str())
    _messages = [MessageModel(**serialize(item)) for item in _messages]
    attachments = get_attachments_by_message_ids(db, [str(item.id) for item in _messages])
    attachments_by_message = defaultdict(list)
    for attachment in attachments:
        attachments_by_message[str(attachment.message_id)].append(AttachmentModel(**serialize(attachment)))
    messages_by_session = defaultdict(list)
    for _message in _messages:
        _message.attachments = attachments_by_message.get(str(_message.id))
        messages_by_session[str(_message.session_id)].append(_message)
    llm_helper.init_session_history(messages_by_session)
    return _messages


@app.get("/sessions")
async def get_sessions_api(user: UserModel = Depends(get_user), db: Session = Depends(get_session)):
    session_list = get_sessions(db, user_id=user.id)
    if len(session_list) == 0:
        session = save_session(db, SessionModel(title=DEFAULT_TITLE, user_id=user.id))
        session_list = [session]
    return session_list


@app.get("/session")
async def clean_session_api(session_id: str):
    llm_helper.clean_session_history(session_id)
    return {'status': True}


@app.post("/session")
async def create_session_api(data: SessionModel,
                             user: UserModel = Depends(get_user),
                             db: Session = Depends(get_session)):
    data.user_id = user.id
    if not data.title:
        data.title = DEFAULT_TITLE
    return save_session(db, data)


@app.put("/session")
async def update_session_api(data: SessionModel, db: Session = Depends(get_session)):
    if not data.id:
        return {}
    return update_session(db, data, ['title', 'status'])


@app.get("/websites")
async def get_websites_api(keyword: str, website_ids: str,
                           user: UserModel = Depends(get_user),
                           db: Session = Depends(get_session)):
    if website_ids:
        website_ids = website_ids.split(',')
    websites = get_websites(db, user_id=user.id, keyword=keyword, website_ids=website_ids)
    return [website_to_model(website) for website in websites]


@app.get("/website")
async def preview_website_api(website_id: str,
                              user: UserModel = Depends(get_user),
                              db: Session = Depends(get_session)):
    website = website_to_model(get_website(db, website_id, user_id=user.id))
    previews = await parse_get_proxy(website.uri, website.xpaths)
    website.preview = previews
    website = update_website(db, website, ['preview'])
    return website_to_model(website)


@app.post("/website")
async def create_website_api(website: WebsiteModel,
                             user: UserModel = Depends(get_user),
                             db: Session = Depends(get_session)):
    if not website.user_id:
        website.user_id = user.id
    website = save_website(db, website)
    return website_to_model(website)


@app.put("/website")
async def update_website_api(website: WebsiteModel, db: Session = Depends(get_session)):
    website = update_website(db, website, ['title', 'uri', 'xpaths', 'scheduled', 'cron'])
    return website_to_model(website)


@app.delete("/website")
async def delete_website_api(website_id: str, db: Session = Depends(get_session)):
    delete_websites(db, [website_id])
    return {'status': True}


@app.post("/rag")
async def create_rag_api(rag: RagModel,
                         user: UserModel = Depends(get_user),
                         db: Session = Depends(get_session)):
    if not rag.user_id:
        rag.user_id = user.id
    rag, ragmaps = save_rag(db, rag)
    return rag_to_model(rag, ragmaps)


@app.put("/rag")
async def update_rag_api(rag: RagModel, db: Session = Depends(get_session)):
    rag, ragmaps = update_rag(db, rag, ['title', 'state'])
    return rag_to_model(rag, ragmaps)


@app.delete("/rag")
async def delete_rag_api(rag_id: str, db: Session = Depends(get_session)):
    delete_rag(db, rag_id)
    return {'status': True}


@app.get("/rags")
async def get_rags_api(state: str,
                       user: UserModel = Depends(get_user),
                       db: Session = Depends(get_session)):
    rags, ragmaps = get_rags(db, state, user.id)
    return rag_to_models(rags, ragmaps)


@app.get("/rag")
async def load_rag_api(rag_id: str,
                       user: UserModel = Depends(get_user),
                       db: Session = Depends(get_session)):
    rag, ragmaps = get_rag(db, rag_id)
    if rag.state == 'initial':
        rag.state = 'pending'
        update_rag(db, rag_to_model(rag), ['state'], cascade=False)
        ragmap_by_type = defaultdict(list)
        for _map in ragmaps:
            ragmap_by_type[_map.type].append(_map.resource_id)
        rag_dict = defaultdict(str)
        if ragmap_by_type['file']:
            files = get_attachments_by_session_id(db, "default",
                                                  user_id=user.id, file_ids=ragmap_by_type['file'])
            for file in files:
                rag_dict[f"{rag.title} > {file.file_name}"] = file.preview
        if ragmap_by_type['website']:
            websites = get_websites(db, user.id, website_ids=ragmap_by_type['website'])
            for website in websites:
                rag_dict[f"{rag.title} > {website.title}[{website.uri}]"] = website.preview
        loop = asyncio.get_event_loop()

        def init_rag(_rag_id, _rag_dict):
            llm_helper.reset_rag_store(_rag_id)
            llm_helper.append_texts(_rag_id, _rag_dict)

        await loop.run_in_executor(executor, init_rag, rag_id, rag_dict)
        rag.state = 'completed'
        update_rag(db, rag_to_model(rag), ['state'], cascade=False)
    return rag_to_model(rag, ragmaps)


@app.post("/completions")
async def completions(data: MessageModel, db: Session = Depends(get_session)):
    if not data.type:
        data.type = "user"
    save_message(db, data)
    response = llm_helper.completions(message=data.content, session_id=data.session_id)
    message = MessageModel(content=response, session_id=data.session_id, type="system")
    return save_message(db, message)


@app.post("/upload")
async def upload_files_api(session_id: str = "default",
                           files: List[UploadFile] = File(...),
                           user: UserModel = Depends(get_user),
                           db: Session = Depends(get_session)):
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

        attachment = AttachmentModel(
            file_name=file.filename,
            file_size=file.size,
            session_id=session_id,
            created_at=now_str(),
            user_id=user.id
        )
        delete_attachments(db, session_id, file.filename)
        result = save_attachment(db, attachment)
        results.append(result)

    def update_previews(_db, _session_id, _file_paths: List[str]):
        _docs = llm_helper.append_docs(_session_id, parse_docs(_file_paths))
        for _doc in _docs:
            _updated = update_attachment(_db,
                                         preview=_doc.page_content[:4000],
                                         session_id=_session_id,
                                         file_name=_doc.metadata["filename"])
            with lock:
                file_queue[session_id] = list(filter(lambda x: x != str(_updated.id), file_queue[session_id]))

    with lock:
        file_queue[session_id].extend([str(file.id) for file in results])
    executor.submit(update_previews, db, session_id, file_paths)
    # update_previews(db, session_id, file_paths)

    return results


@app.get("/files")
async def get_files_api(keyword: str, file_ids: str,
                        user: UserModel = Depends(get_user),
                        db: Session = Depends(get_session)):
    if file_ids:
        file_ids = file_ids.split(',')
    files = get_attachments_by_session_id(db, "default",
                                          user_id=user.id, keyword=keyword, file_ids=file_ids)
    return [AttachmentModel(**serialize(file)) for file in files]


@app.delete("/file")
async def delete_file_api(file_id: str, db: Session = Depends(get_session)):
    delete_attachments(db, file_id=file_id)
    return {'status': True}


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
            'status': 'initial',
            'websites': []
        }

    async def ws_send_message(_websocket: WebSocket, _data: MessageModel):
        _response = build_response(_data)
        _files = defaultdict(str)
        for item in _data.attachments:
            _files[item.file_name] = item.preview
        try:
            print('ws_send_message', _data)
            async for chunk in llm_helper.streaming(
                    _data.content, _data.session_id,
                    model=_data.model, rag_id=_data.rag_id, files=_files, mode=_data.mode
            ):
                if chunk.get('type') == 'web':
                    _response['websites'] += chunk.get('content')
                else:
                    _response['websites'] = []
                    _response['content'] += chunk.get('content')
                    _response['status'] = 'pending'
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


@app.websocket("/ws/files")
async def websocket_files(websocket: WebSocket, db: Session = Depends(get_session)):
    await websocket.accept()
    session_id = 'default'

    while True:
        try:
            with lock:
                pre_value = file_queue[session_id]
            await websocket.receive_json()
            with lock:
                new_value = file_queue[session_id]
            diff = list(set(pre_value) - set(new_value))
            if len(diff) > 0:
                files = get_attachments(db, diff)
                files = [serialize(file) for file in files]
                await websocket.send_json(files)
        except WebSocketDisconnect:
            print('[/ws/files] - receive msg disconnected')
        except RuntimeError as e:
            print(f"[/ws/files] - receive msg disconnected, {e}")
            break
