import copy

from sqlalchemy.orm import Session as DBSession

from backend.mapper.mapper import rag_to_entity
from backend.model.rag_model import RagModel


def save_rag(db: DBSession, rag: RagModel):
    entity, maps = rag_to_entity(rag)
    db.add_all(maps)
    db.add(entity)
    db.commit()
    db.refresh(entity)
    return copy.deepcopy(entity), copy.deepcopy(maps)
