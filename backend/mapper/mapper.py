from backend.entity.models import Website, serialize_model
from backend.model.website_model import WebsiteModel

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
