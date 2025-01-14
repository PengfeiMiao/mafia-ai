import logging
import os

from sqlalchemy.orm import Session
from fastapi import FastAPI, status, Depends
from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse

from backend.config.config import SECRET_KEY
from backend.entity.connection import get_session
from backend.model.message_model import MessageModel
from backend.model.user_model import UserModel
from backend.service.pg_helper import PgDBHelper
from backend.repo.message_repo import save_message

logging.basicConfig(level=logging.WARNING)

app = FastAPI()
pgHelper = PgDBHelper()

unauthorized_res = JSONResponse(
    status_code=status.HTTP_401_UNAUTHORIZED,
    content={"detail": "Unauthorized"},
    headers={"WWW-Authenticate": "Bearer"})


# @app.middleware("http")
# async def check_authorization(request: Request, call_next):
#     if request.url.path != "/login":
#         auth_header = request.headers.get("Authorization")
#         if not auth_header or not auth_header.startswith('Bearer ') or auth_header.split(' ')[1] != SECRET_KEY:
#             return unauthorized_res
#
#     response = await call_next(request)
#     return response


@app.post("/login")
async def login(data: UserModel):
    data_dict = jsonable_encoder(data)
    if data_dict['password'] != SECRET_KEY:
        return unauthorized_res
    return {'status': True}


@app.post("/completions")
async def completions(data: MessageModel, session: Session = Depends(get_session)):
    save_message(session, data)
    return {'context': data.text}


@app.get("/db/init")
async def db_init():
    folder = os.path.abspath(os.path.join(os.path.dirname(__file__)))
    if pgHelper.has_tables() == 0:
        pgHelper.execute_sql(folder + '/resource/db/schema.sql')
    return {'status': True}
