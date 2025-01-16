from datetime import datetime
from typing import List

from sqlalchemy.orm import Session
from backend.entity.models import Message
from backend.model.message_model import MessageModel


def save_message(db: Session, message: MessageModel):
    entity = Message(
        id=message.id,
        content=message.content,
        type=message.type,
        session_id=message.session_id,
        created_at=datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    )
    db.add(entity)
    db.commit()
    db.refresh(entity)
    return entity

def get_messages(db: Session, session_ids: List[str]):
    if not session_ids:
        return []
    result = db.query(Message).filter(Message.session_id.in_(session_ids)).all()
    return result
