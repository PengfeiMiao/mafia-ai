import uuid
from datetime import datetime
from sqlalchemy import Column, String, UUID, DateTime
from backend.entity.connection import Base, engine


class Message(Base):
    __tablename__ = "message"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    session_id = Column(String)
    content = Column(String)
    type = Column(String)
    created_at = Column(DateTime, default=datetime.now())


Base.metadata.create_all(engine)
