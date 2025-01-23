from datetime import datetime
from typing import Type, List

from sqlalchemy.orm import Session as DBSession

from backend.entity.models import Session
from backend.model.session_model import SessionModel


def save_session(db: DBSession, session: SessionModel):
    entity = Session(**session.__dict__)
    if not entity.created_at:
        entity.created_at = datetime.now()
    db.add(entity)
    db.commit()
    db.refresh(entity)
    return entity

def update_session(db: DBSession, session: SessionModel, fields: List[str]):
    entity = db.query(Session).filter_by(id=session.id)
    mapping = session.__dict__
    for field in entity.__dict__.keys():
        if not field in fields:
            mapping.pop(field, 'None')
    entity.update(mapping)
    db.commit()
    return entity.one()

def get_sessions(db: DBSession, user_id: str):
    if not user_id:
        return []
    return (db.query(Session)
              .filter(Session.user_id == user_id)
              .order_by(Session.created_at.asc())
              .all())

def get_session_by(db: DBSession, session: SessionModel) -> Type[Session]:
    return db.query(Session).filter_by(id=session.id).one()
