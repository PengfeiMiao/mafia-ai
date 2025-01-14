import logging

from sqlalchemy.orm import Session
from fastapi import FastAPI, status, Depends
from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse

from backend.config.config import api_key
from backend.entity.connection import get_session
from backend.model.message_model import MessageModel
from backend.model.user_model import UserModel
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
#         auth_header = request.headers.get("Authorization")
#         if not auth_header or not auth_header.startswith('Bearer ') or auth_header.split(' ')[1] != API_KEY:
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


@app.post("/completions")
async def completions(data: MessageModel, session: Session = Depends(get_session)):
    # save_message(session, data)
    result = llm_helper.completions(message=data.text, session_id="123")
    return {'context': result}
