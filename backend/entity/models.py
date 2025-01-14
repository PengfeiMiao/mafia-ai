import uuid
from sqlalchemy import Column, String, UUID
from backend.entity.connection import Base, engine


class Message(Base):
    __tablename__ = "message"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    text = Column(String)


Base.metadata.create_all(engine)
