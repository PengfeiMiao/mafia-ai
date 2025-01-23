import logging
from datetime import datetime
from typing import List
from requests import Request

from fastapi import FastAPI, status, Depends, WebSocket, WebSocketDisconnect
from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session

from backend.config.config import api_key
from backend.entity.connection import get_session
from backend.model.message_model import MessageModel
from backend.model.session_model import SessionModel
from backend.model.user_model import UserModel
from backend.repo.message_repo import get_messages, save_message
from backend.service.llm_helper import LLMHelper

logging.basicConfig(level=logging.WARNING)

API_KEY = api_key()

llm_helper = LLMHelper()

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
async def messages(sessions: List[SessionModel], db: Session = Depends(get_session)):
    return get_messages(db, session_ids=[item.id for item in sessions])


@app.post("/completions")
async def completions(data: MessageModel, db: Session = Depends(get_session)):
    if not data.type:
        data.type = "user"
    save_message(db, data)
    response = llm_helper.completions(message=data.content, session_id=data.session_id)
    message = MessageModel(content=response, session_id=data.session_id, type="system")
    return save_message(db, message)


@app.websocket("/ws/stream")
async def websocket_stream(websocket: WebSocket, db: Session = Depends(get_session)):
    await websocket.accept()

    def now():
        return datetime.now().strftime('%Y-%m-%d %H:%M:%S')

    def build_response(_data: MessageModel):
        return {
            'id': _data.id,
            'session_id': _data.session_id,
            'content': '',
            'type': 'system',
            'created_at': now(),
            'status': 'pending'
        }

    async def ws_send_message(_websocket: WebSocket, _data: MessageModel):
        _response = build_response(_data)
        try:
            async for chunk in llm_helper.streaming(_data.content, _data.session_id):
                _response['content'] += chunk
                await _websocket.send_json(_response)
            _response['status'] = 'completed'
            _response['created_at'] = now()
            await _websocket.send_json(_response)
            return _response
        except WebSocketDisconnect:
            print('[/ws/stream] - send msg disconnected')
            _response['created_at'] = now()
            if _response.get('content') == '':
                _response['content'] = 'Network Error.'
            return _response

    while True:
        try:
            data = await websocket.receive_json()
            if not data.get('type'):
                 data['type'] = 'user'
            save_message(db, MessageModel(**data))
            data['id'] = data.get('answer_id')
            response = await ws_send_message(websocket, MessageModel(**data))
            save_message(db, MessageModel(**response))
        except WebSocketDisconnect:
            print('[/ws/stream] - receive msg disconnected')
        except RuntimeError as e:
            print(f"[/ws/stream] - receive msg disconnected, {e}")
            break