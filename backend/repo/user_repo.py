import base64

from sqlalchemy import or_
from sqlalchemy.orm import Session as DBSession

from backend.entity.entity import User
from backend.model.user_model import UserModel
from backend.util.common import now_utc

sessions = {}


def save_user(db: DBSession, user: UserModel):
    entity = User(**user.__dict__)
    db.add(entity)
    db.commit()
    db.refresh(entity)
    return entity


def validate_user(db: DBSession, keyword: str, password: str):
    token = base64.b64encode(f"{keyword}&{password}".encode('utf-8'))
    if token in sessions:
        return True
    entity = (db.query(User)
              .filter_by(status='active')
              .filter(or_(User.username.__eq__(keyword), User.email.__eq__(keyword))))
    entity = entity.one_or_none()
    flag = entity and password == entity.password
    if flag:
        sessions[token] = now_utc()
    return flag
