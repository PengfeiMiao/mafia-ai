import uuid
from datetime import datetime
from sqlalchemy import Column, String, UUID, DateTime, Integer
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


Base.metadata.create_all(engine)
