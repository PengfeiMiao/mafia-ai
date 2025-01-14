from sqlalchemy.orm import Session

from backend.entity.models import Message
from backend.model.message_model import MessageModel


def save_message(session: Session, message: MessageModel):
    entity = Message(text=message.text)
    session.add(entity)
    session.commit()
    session.refresh(entity)
    return entity
