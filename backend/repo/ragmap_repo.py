import copy
from typing import List

from sqlalchemy.orm import Session as DBSession

from backend.entity.entity import Ragmap
from backend.mapper.mapper import clear_mapping
from backend.model.ragmap_model import RagmapModel


def save_ragmap(db: DBSession, ragmap: RagmapModel):
    entity = Ragmap(**ragmap.__dict__)
    db.add(entity)
    db.commit()
    db.refresh(entity)
    return copy.deepcopy(entity)


def delete_ragmaps(db: DBSession, ids: List[str]):
    entity = db.query(Ragmap).filter(Ragmap.id.in_(ids))
    entity.update({Ragmap.status: 'inactive'})
    db.commit()


def update_ragmap(db: DBSession, ragmap: RagmapModel, fields: List[str]):
    entity = db.query(Ragmap).filter_by(id=ragmap.id)
    mapping = clear_mapping(ragmap.__dict__, fields)
    entity.update(mapping)
    db.commit()
    return entity.one()


def get_ragmaps(db: DBSession, user_id: str):
    query = db.query(Ragmap).filter_by(user_id=user_id, status='active')
    return query.order_by(Ragmap.created_at.desc()).all()
