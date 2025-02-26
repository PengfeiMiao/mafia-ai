from typing import List

from sqlalchemy.orm import Session as DBSession

from backend.entity.models import Session
from backend.model.session_model import SessionModel
from backend.util.common import now_utc


def save_session(db: DBSession, session: SessionModel):
    entity = Session(**session.__dict__)
    if not entity.created_at:
        entity.created_at = now_utc()
    db.add(entity)
    db.commit()
    db.refresh(entity)
    return entity

def update_session(db: DBSession, session: SessionModel, fields: List[str]):
    entity = db.query(Session).filter_by(id=session.id)
    mapping = session.__dict__
    for field in Session.__dict__.keys():
        if field not in fields or not mapping.get(field):
            mapping.pop(field, 'None')
    entity.update(mapping)
    db.commit()
    return entity.one()

def get_sessions(db: DBSession, user_id: str):
    if not user_id:
        return []
    return (db.query(Session)
              .filter_by(user_id=user_id, status='active')
              .order_by(Session.created_at.desc())
              .all())
