from sqlalchemy import or_
from sqlalchemy.orm import Session as DBSession

from backend.entity.entity import User, serialize
from backend.model.user_model import UserModel
from backend.util.common import now_utc, b64encode, b64decode, is_valid_email

sessions = {}


def get_user(db: DBSession, user: UserModel, fields=None):
    if not fields:
        fields = []
    query = db.query(User).filter_by(status='active')
    if 'username' in fields and 'email' in fields:
        query = query.filter(or_(
            User.username.__eq__(user.username),
            User.email.__eq__(user.email)
        ))
    elif 'username' in fields:
        query = query.filter_by(username=user.username)
    elif 'email' in fields:
        query = query.filter_by(email=user.email)
    else:
        return None
    return query.all()


def save_user(db: DBSession, user: UserModel):
    mapping = user.__dict__
    mapping.pop('code', 'None')
    entity = User(**mapping)
    db.add(entity)
    db.commit()
    db.refresh(entity)
    return entity


def validate_user(db: DBSession, user: UserModel):
    token = b64encode(f"{user.id}&{user.username}&{user.password}")
    if token in sessions:
        return token
    fields = ['username']
    if is_valid_email(user.username):
        fields = ['email']
        user.email = user.username
    data = get_user(db, user, fields)
    entity = data[0] if data and len(data) > 0 else None
    flag = entity and user.password == entity.password
    if not flag:
        return None
    token = b64encode(f"{entity.id}&{entity.username if 'username' in fields else entity.email}&{entity.password}")
    sessions[token] = {**serialize(entity), 'login_at': now_utc()}
    return token


def parse_user(token):
    auth_values = b64decode(token).split("&", 2)
    if len(auth_values) < 3:
        raise RuntimeError('Invalid token')
    auth_info = {'id': auth_values[0], 'username': auth_values[1], 'password': auth_values[2]}
    return UserModel(**auth_info)


def get_online_users():
    users = []
    for _, value in sessions.items():
        users.append(value['id'])
    return list(set(users))