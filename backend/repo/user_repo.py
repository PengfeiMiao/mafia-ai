from sqlalchemy.orm import Session as DBSession

from backend.entity.entity import User, serialize
from backend.model.user_model import UserModel
from backend.util.common import now_utc, b64encode, b64decode, is_valid_email

sessions = {}


def save_user(db: DBSession, user: UserModel):
    entity = User(**user.__dict__)
    db.add(entity)
    db.commit()
    db.refresh(entity)
    return entity


def validate_user(db: DBSession, user: UserModel):
    token = b64encode(f"{user.id}&{user.username}&{user.password}")
    if token in sessions:
        return token

    query = db.query(User).filter_by(status='active')
    if is_valid_email(user.username):
        query = query.filter_by(email=user.username)
    else:
        query = query.filter_by(username=user.username)
    entity = query.one_or_none()
    flag = entity and user.password == entity.password
    if not flag:
        return None
    sessions[token] = {**serialize(entity), 'login_at': now_utc()}
    return token


def parse_user(token):
    auth_values = b64decode(token).split("&", 2)
    if len(auth_values) < 3:
        raise RuntimeError('Invalid token')
    auth_info = {'id': auth_values[0], 'username': auth_values[1], 'password': auth_values[2]}
    return UserModel(**auth_info)
