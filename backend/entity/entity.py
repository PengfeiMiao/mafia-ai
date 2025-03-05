import uuid
from datetime import datetime
from typing import Any, Dict

from sqlalchemy import Column, String, UUID, DateTime, Integer, Boolean
from sqlalchemy.orm import DeclarativeMeta

from backend.entity.connection import Base, engine
from backend.util.common import now_utc, DEFAULT_FORMAT


class Message(Base):
    __tablename__ = "message"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    session_id = Column(String)
    content = Column(String)
    type = Column(String)
    created_at = Column(DateTime, default=now_utc())


class Session(Base):
    __tablename__ = "session"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    user_id = Column(String)
    title = Column(String)
    status = Column(String, default="active")
    created_at = Column(DateTime, default=now_utc())


class Attachment(Base):
    __tablename__ = "attachment"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    message_id = Column(String)
    session_id = Column(String)
    file_name = Column(String)
    file_size = Column(Integer)
    preview = Column(String)
    status = Column(String, default="active")
    created_at = Column(DateTime, default=now_utc())
    user_id = Column(String)


class Website(Base):
    __tablename__ = "website"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    title = Column(String)
    uri = Column(String)
    xpaths = Column(String)
    scheduled = Column(Boolean)
    cron = Column(String)
    preview = Column(String)
    status = Column(String, default="active")
    created_at = Column(DateTime, default=now_utc())
    user_id = Column(String)


class Ragmap(Base):
    __tablename__ = "ragmap"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    title = Column(String)
    rag_id = Column(String)
    resource_id = Column(String)
    type = Column(String)


class Rag(Base):
    __tablename__ = "rag"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    title = Column(String)
    status = Column(String, default="active")
    created_at = Column(DateTime, default=now_utc())
    user_id = Column(String)


def serialize(instance: Any) -> Dict[str, Any]:
    if isinstance(instance.__class__, DeclarativeMeta):
        data = {}
        for column in instance.__table__.columns:
            value = getattr(instance, column.name)
            if isinstance(value, datetime):
                value = value.strftime(DEFAULT_FORMAT)
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
