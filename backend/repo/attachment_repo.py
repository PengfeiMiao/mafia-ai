from datetime import datetime
from typing import List

from sqlalchemy.orm import Session as DBSession

from backend.entity.models import Attachment
from backend.model.attachment_model import AttachmentModel


def save_attachment(db: DBSession, attachment: AttachmentModel):
    entity = Attachment(**attachment.__dict__)
    db.add(entity)
    db.commit()
    db.refresh(entity)
    return entity

def update_attachments(db: DBSession, message_id: str, file_ids: List[str]):
    if not message_id or len(file_ids) == 0:
        return []
    entities = db.query(Attachment).filter(Attachment.id.in_(file_ids))
    entities.update(message_id=message_id)
    db.commit()
    return entities.all()

def get_attachments(db: DBSession, message_id: str):
    if not message_id:
        return []
    return (db.query(Attachment)
              .filter_by(message_id=message_id, status='active')
              .order_by(Attachment.created_at.desc())
              .all())
