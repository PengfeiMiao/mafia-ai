import asyncio
import logging
from datetime import datetime
from typing import List
from uuid import uuid4

from fastapi import FastAPI, status, Depends, WebSocket, WebSocketDisconnect
from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse, StreamingResponse
from sqlalchemy.orm import Session

from backend.config.config import api_key
from backend.entity.connection import get_session
from backend.model.message_model import MessageModel
from backend.model.session_model import SessionModel
from backend.model.user_model import UserModel
from backend.repo.message_repo import get_messages, save_message
from backend.service.llm_helper import LLMHelper

# from backend.repo.message_repo import save_message

logging.basicConfig(level=logging.WARNING)

API_KEY = api_key()

llm_helper = LLMHelper()

app = FastAPI()

unauthorized_res = JSONResponse(
    status_code=status.HTTP_401_UNAUTHORIZED,
    content={"detail": "Unauthorized"},
    headers={"WWW-Authenticate": "Bearer"})


# @app.middleware("http")
# async def check_authorization(request: Request, call_next):
#     if request.url.path != "/login":
#         auth_header = request.headers.get("api-key")
#         if not auth_header or auth_header != API_KEY:
#             return unauthorized_res
#
#     response = await call_next(request)
#     return response


@app.post("/login")
async def login(data: UserModel):
    data_dict = jsonable_encoder(data)
    if data_dict['password'] != API_KEY:
        return unauthorized_res
    return {'status': True}


@app.post("/messages")
async def messages(sessions: List[SessionModel], db: Session = Depends(get_session)):
    return get_messages(db, session_ids=[item.session_id for item in sessions])


@app.post("/completions")
async def completions(data: MessageModel, db: Session = Depends(get_session)):
    if not data.type:
        data.type = "user"
    save_message(db, data)
    response = llm_helper.completions(message=data.content, session_id=data.session_id)
    message = MessageModel(content=response, session_id=data.session_id, type="system")
    return save_message(db, message)


@app.post("/streaming")
async def streaming(data: MessageModel, db: Session = Depends(get_session)) -> StreamingResponse:
    if not data.type:
        data.type = "user"
    # save_message(db, data)
    async def generator():
        async for chunk in llm_helper.streaming(data.content, session_id=data.session_id):
            yield chunk
            await asyncio.sleep(0.1)
    return StreamingResponse(
        generator(),
        media_type="text/event-stream"
    )


@app.websocket("/ws/stream")
async def websocket_stream(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_json()
            message_id = data.get('next_id')
            session_id = data.get('session_id')
            message = data.get('content')
            response = {
                'id': message_id,
                'session_id': session_id,
                'content': '',
                'type': 'system',
                'created_at': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
                'status': 'pending'
            }
            async for chunk in llm_helper.streaming(message, session_id):
                response['content'] += chunk
                await websocket.send_json(response)
            response['status'] = 'completed'
            await websocket.send_json(response)
    except WebSocketDisconnect:
        print("Client disconnected")
