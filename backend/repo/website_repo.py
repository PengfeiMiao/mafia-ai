import copy
from typing import List

from sqlalchemy import or_
from sqlalchemy.orm import Session as DBSession

from backend.entity.entity import Website
from backend.mapper.mapper import clear_mapping, website_to_entity
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
    mapping = clear_mapping(new_entity.__dict__, fields)
    entity.update(mapping)
    db.commit()
    return entity.one()


def get_websites(db: DBSession, user_id: str, keyword=None, scheduled=None, website_ids=None):
    query = db.query(Website).filter_by(user_id=user_id, status='active')
    if scheduled is not None:
        query = query.filter_by(scheduled=scheduled)
    if keyword:
        query = query.filter(or_(Website.title.like(f"%{keyword}%"), Website.uri.like(f"%{keyword}%")))
    if website_ids:
        query = query.filter(Website.id.in_(website_ids))
    return query.order_by(Website.created_at.desc()).all()


def get_website(db: DBSession, website_id: str, user_id: str):
    return (db.query(Website)
            .filter_by(id=website_id, user_id=user_id, status='active')
            .one())
