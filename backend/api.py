import logging
from typing import List

from requests import Request
from sqlalchemy.orm import Session
from fastapi import FastAPI, status, Depends
from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse

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
    return get_messages(db, session_ids=[item.session_id for item in sessions])


@app.post("/completions")
async def completions(data: MessageModel, db: Session = Depends(get_session)):
    save_message(db, data)
    result = llm_helper.completions(message=data.content, session_id=data.session_id)
    save_message(db, MessageModel(content=result, session_id=data.session_id, type="system"))
    return {'content': result}
