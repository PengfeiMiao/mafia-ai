import copy
from typing import List

from sqlalchemy.orm import Session as DBSession

from backend.entity.models import Website
from backend.mapper.mapper import website_to_entity
from backend.model.website_model import WebsiteModel


def save_website(db: DBSession, website: WebsiteModel):
    entity = website_to_entity(website)
    db.add(entity)
    db.commit()
    db.refresh(entity)
    return copy.deepcopy(entity)


def delete_websites(db: DBSession, ids: List[str]):
    entity = db.query(Website).filter(Website.id.in_(ids))
    entity.update({Website.status: 'inactive'})
    db.commit()


def update_website(db: DBSession, website: WebsiteModel, fields: List[str]):
    entity = db.query(Website).filter_by(id=website.id)
    new_entity = website_to_entity(website)
    mapping = new_entity.__dict__
    keys = list(mapping.keys())
    for field in keys:
        if field not in fields or not mapping.get(field):
            mapping.pop(field, 'None')
    entity.update(mapping)
    db.commit()
    return entity.one()


def get_websites(db: DBSession, user_id: str):
    return (db.query(Website)
            .filter_by(user_id=user_id, status='active')
            .order_by(Website.created_at.desc())
            .all())


def get_website(db: DBSession, website_id: str, user_id: str):
    return (db.query(Website)
            .filter_by(id=website_id, user_id=user_id, status='active')
            .one())
