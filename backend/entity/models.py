import uuid
from datetime import datetime
from typing import Any, Dict

from sqlalchemy import Column, String, UUID, DateTime, Integer
from sqlalchemy.orm import DeclarativeMeta

from backend.entity.connection import Base, engine


class Message(Base):
    __tablename__ = "message"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    session_id = Column(String)
    content = Column(String)
    type = Column(String)
    created_at = Column(DateTime, default=datetime.now())


class Session(Base):
    __tablename__ = "session"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    user_id = Column(String)
    title = Column(String)
    status = Column(String, default="active")
    created_at = Column(DateTime, default=datetime.now())


class Attachment(Base):
    __tablename__ = "attachment"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    message_id = Column(String)
    file_name = Column(String)
    file_size = Column(Integer)
    status = Column(String, default="active")
    created_at = Column(DateTime, default=datetime.now())


def serialize_model(model_instance: Any) -> Dict[str, Any]:
    if isinstance(model_instance.__class__, DeclarativeMeta):
        data = {}
        for column in model_instance.__table__.columns:
            value = getattr(model_instance, column.name)
            if isinstance(value, datetime):
                value = value.strftime("%Y-%m-%d %H:%M:%S")
            elif isinstance(value, (int, float, str, bool)) or value is None:
                pass
            else:
                try:
                    value = str(value)
                except RuntimeError:
                    value = None
            data[column.name] = value
        return data
    raise ValueError("Not a valid SQLAlchemy ORM model instance.")


Base.metadata.create_all(engine)
