from typing import List

from sqlalchemy.orm import Session
from backend.entity.models import Message
from backend.model.message_model import MessageModel


def save_message(db: Session, message: MessageModel):
    entity = Message(text=message.text)
    db.add(entity)
    db.commit()
    db.refresh(entity)
    return entity

def get_messages(db: Session, session_ids: List[str]):
    result = db.query(Message).filter(Message.session_id.in_(session_ids))
    print(result)
    return []
