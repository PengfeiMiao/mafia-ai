import copy
import uuid
from typing import List

from sqlalchemy.orm import Session as DBSession

from backend.entity.entity import Rag, Ragmap
from backend.mapper.mapper import rag_to_entity, clear_mapping
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


def update_rag(db: DBSession, rag: RagModel, fields: List[str], cascade=True):
    entity = db.query(Rag).filter_by(id=rag.id)
    new_entity, new_maps = rag_to_entity(rag)
    mapping = clear_mapping(new_entity.__dict__, fields)
    if cascade:
        old_maps = db.query(Ragmap).filter_by(rag_id=rag.id).all()
        for _map in old_maps:
            db.delete(_map)
        db.commit()
    entity.update(mapping)
    if cascade:
        for _map in new_maps:
            _map.rag_id = rag.id
        db.add_all(new_maps)
    db.commit()
    return entity.one(), new_maps


def delete_rag(db: DBSession, rag_id: str):
    entity = db.query(Rag).filter_by(id=rag_id)
    maps = db.query(Ragmap).filter_by(rag_id=rag_id).all()
    for _map in maps:
        db.delete(_map)
    entity.update({Rag.status: 'inactive'})
    db.commit()


def get_rags(db: DBSession, state: str, user_id: str):
    query = db.query(Rag).filter_by(user_id=user_id, status='active')
    if state:
        query = query.filter_by(state=state)
    entities = query.order_by(Rag.created_at.desc()).all()
    ids = [str(entity.id) for entity in entities]
    maps = db.query(Ragmap).filter(Ragmap.rag_id.in_(ids)).all()
    return entities, maps

def get_rag(db: DBSession, rag_id: str):
    entity = db.query(Rag).filter_by(id=rag_id, status='active').one()
    maps = db.query(Ragmap).filter_by(rag_id=rag_id).all()
    return entity, maps

