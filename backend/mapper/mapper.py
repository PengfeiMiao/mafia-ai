from collections import defaultdict
from typing import List

from backend.entity.entity import Website, Rag, Ragmap, serialize
from backend.model.rag_model import RagModel
from backend.model.ragmap_model import RagmapModel
from backend.model.website_model import WebsiteModel

SEPARATOR = ';;;'


def website_to_model(website: Website) -> WebsiteModel:
    mapping = serialize(website)
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


def rag_to_entity(rag: RagModel) -> (Rag, List[Ragmap]):
    mapping = rag.__dict__
    resources = mapping.get('resources', [])
    mapping.pop('resources', 'None')
    return Rag(**mapping), [Ragmap(**ragmap.__dict__) for ragmap in resources]


def rag_to_model(rag: Rag, ragmaps: List[Ragmap]) -> RagModel:
    model = RagModel(**serialize(rag))
    model.resources = [RagmapModel(**serialize(ragmap)) for ragmap in ragmaps]
    return model


def rag_to_models(rags: List[Rag], ragmaps: List[Ragmap]) -> RagModel:
    ragmaps_by_rag_id = defaultdict(list)
    for ragmap in ragmaps:
        ragmaps_by_rag_id[str(ragmap.rag_id)].append(ragmap)
    models = []
    for rag in rags:
        model = rag_to_model(rag, ragmaps_by_rag_id[str(rag.id)])
        models.append(model)
    return models


def clear_mapping(mapping: dict, fields: List[str]):
    keys = list(mapping.keys())
    for field in keys:
        if field not in fields or mapping.get(field) is None:
            mapping.pop(field, 'None')
    return mapping
