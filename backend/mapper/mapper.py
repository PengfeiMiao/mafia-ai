from typing import List, Any, Dict

from sqlalchemy.orm import DeclarativeMeta
from datetime import datetime

from backend.entity.models import Website
from backend.model.website_model import WebsiteModel
from backend.util.common import DEFAULT_FORMAT

SEPARATOR = ';;;'


def website_to_model(website: Website) -> WebsiteModel:
    mapping = serialize_model(website)
    xpaths = mapping.get('xpaths')
    mapping['xpaths'] = str(xpaths).split(SEPARATOR) if xpaths else []
    preview = mapping.get('preview')
    mapping['preview'] = str(preview).split(SEPARATOR) if preview else []
    return WebsiteModel(**mapping)


def website_to_entity(website: WebsiteModel) -> Website:
    mapping = website.__dict__
    xpaths = mapping.get('xpaths', [])
    mapping['xpaths'] = SEPARATOR.join(xpaths) if xpaths and len(xpaths) > 0 else None
    preview = mapping.get('preview', [])
    mapping['preview'] = SEPARATOR.join(preview) if preview and len(preview) > 0 else None
    return Website(**mapping)


def serialize_model(model_instance: Any) -> Dict[str, Any]:
    if isinstance(model_instance.__class__, DeclarativeMeta):
        data = {}
        for column in model_instance.__table__.columns:
            value = getattr(model_instance, column.name)
            if isinstance(value, datetime):
                value = value.strftime(DEFAULT_FORMAT)
            elif isinstance(value, (int, float, str, bool)) or value is None:
                pass
            else:
                try:
                    value = str(value)
                except RuntimeError:
                    value = None
            data[column.name] = value
        return data
    raise ValueError("Not a valid SQLAlchemy ORM model instance.")


def clear_mapping(mapping: dict, fields: List[str]):
    keys = list(mapping.keys())
    for field in keys:
        if field not in fields or mapping.get(field) is None:
            mapping.pop(field, 'None')
    return mapping
