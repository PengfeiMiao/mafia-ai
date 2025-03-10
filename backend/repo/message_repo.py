from datetime import datetime
from typing import List

from sqlalchemy.orm import Session

from backend.entity.entity import Message
from backend.model.message_model import MessageModel
from backend.repo.attachment_repo import update_attachments
from backend.util.common import DEFAULT_FORMAT, now_utc


def save_message(db: Session, message: MessageModel):
    created_at = datetime.strptime(message.created_at, DEFAULT_FORMAT) \
        if message.created_at else now_utc()
    entity = Message(
        id=message.id,
        content=message.content,
        type=message.type,
        session_id=message.session_id,
        created_at=created_at
    )
    db.add(entity)
    db.commit()
    db.refresh(entity)
    update_attachments(db, entity.id, [] if not message.attachments else [item.id for item in message.attachments])
    return entity


def get_messages(db: Session, session_ids: List[str], limit=None, offset=None):
    if not session_ids:
        return []
    query = db.query(Message).filter(Message.session_id.in_(session_ids))
    if offset:
        query = query.filter(Message.created_at < offset)
    return query.order_by(Message.created_at.desc()).limit(limit).all()[::-1]
