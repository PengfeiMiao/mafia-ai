from typing import List

from sqlalchemy.orm import Session as DBSession

from backend.entity.models import Session
from backend.model.session_model import SessionModel
from backend.util.common import now_utc
from backend.mapper.mapper import clear_mapping


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
    mapping = clear_mapping(session.__dict__, fields)
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
