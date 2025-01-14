import json
from collections import defaultdict


def to_dict(data, ignore_id=True):
    obj_dict = vars(data)
    if ignore_id:
        obj_dict.pop('id', None)
    return clear_dict(obj_dict)


def clear_dict(data: dict):
    keys_to_remove = [key for key, val in data.items() if val is None]
    for key in keys_to_remove:
        data.pop(key)
    for key, value in data.items():
        if isinstance(value, list):
            data[key] = json.dumps(value, ensure_ascii=False)
    return data


def group_dict(data: list, key: str):
    grouped_data = defaultdict(list)
    for item in data:
        grouped_data[getattr(item, key)].append(item)
    return dict(grouped_data)
