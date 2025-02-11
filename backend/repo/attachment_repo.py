import copy
from typing import List

from sqlalchemy.orm import Session as DBSession

from backend.entity.models import Attachment
from backend.model.attachment_model import AttachmentModel


def save_attachment(db: DBSession, attachment: AttachmentModel):
    entity = Attachment(**attachment.__dict__)
    db.add(entity)
    db.commit()
    db.refresh(entity)
    return copy.deepcopy(entity)

def delete_attachments(db: DBSession, session_id: str, file_name: str):
    entity = (db.query(Attachment)
              .filter_by(session_id=session_id, file_name=file_name, status='active'))
    entity.update({Attachment.status: 'inactive'})
    db.commit()

def update_attachment(db: DBSession, preview: str, session_id: str, file_name: str):
    entity = (db.query(Attachment)
              .filter_by(session_id=session_id, file_name=file_name, status='active'))
    entity.update({Attachment.preview: preview})
    db.commit()
    return entity.one()

def update_attachments(db: DBSession, message_id: str, ids: List[str]):
    if not message_id or len(ids) == 0:
        return []
    entities = db.query(Attachment).filter(Attachment.id.in_(ids))
    entities.update({Attachment.message_id: message_id})
    db.commit()
    return entities.all()

def get_attachments_by_message_ids(db: DBSession, message_ids: List[str]):
    if len(message_ids) == 0:
        return []
    return (db.query(Attachment)
              .filter(Attachment.message_id.in_(message_ids))
              .order_by(Attachment.created_at.desc())
              .all())

def get_attachments(db: DBSession, ids: List[str]):
    if len(ids) == 0:
        return []
    return (db.query(Attachment)
            .filter(Attachment.id.in_(ids))
            .order_by(Attachment.created_at.desc())
            .all())