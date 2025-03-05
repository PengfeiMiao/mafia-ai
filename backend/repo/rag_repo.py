import copy
import uuid

from sqlalchemy.orm import Session as DBSession

from backend.entity.entity import Rag, Ragmap
from backend.mapper.mapper import rag_to_entity
from backend.model.rag_model import RagModel


def save_rag(db: DBSession, rag: RagModel):
    entity, maps = rag_to_entity(rag)
    entity.id = uuid.uuid4()
    db.add(entity)
    for _map in maps:
        _map.rag_id = entity.id
    db.add_all(maps)
    db.commit()
    db.refresh(entity)
    return copy.deepcopy(entity), maps


def get_rags(db: DBSession, user_id: str):
    entities = (db.query(Rag).filter_by(user_id=user_id, status='active')
             .order_by(Rag.created_at.desc()).all())
    ids = [str(entity.id) for entity in entities]
    maps = db.query(Ragmap).filter(Ragmap.rag_id.in_(ids)).all()
    return entities, maps

