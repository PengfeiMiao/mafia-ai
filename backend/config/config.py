import logging
import os

import yaml

def get_config(key:str):
    script_path = os.path.abspath(__file__)
    script_dir = os.path.dirname(script_path)
    parent_dir = os.path.dirname(script_dir)
    try:
        with open(f"{parent_dir}/resource/config.yml", "r") as file:
            config = yaml.safe_load(file)
            keys = key.split(".")
            value = config
            for k in keys:
                value = value[k]
            return value
    except Exception as e:
        logging.error(e)
        return None

def get_config_map(key:str, field:str, value):
    maps = get_config(key)
    for item in maps:
        if item[field] == value:
            return item
    return None

def api_key():
    return get_config("api.key")

def db_host():
    return get_config("database.host")

def db_port():
    return get_config("database.port")

def db_user():
    return get_config("database.username")

def db_pwd():
    return get_config("database.password")

def db_schema():
    return get_config("database.schema")

def db_url():
    return f'postgresql://{db_user()}:{db_pwd()}@{db_host()}:{db_port()}/{db_schema()}'

def chat_model_meta():
    model_name = get_config("chat_model")
    return get_config_map("models","name", model_name)

def max_tokens():
    return get_config("max_tokens")

def max_histories():
    return get_config("max_histories")

def file_dir():
    return get_config("file_dir")

def embd_model_meta():
    embd_map = get_config("embedding")
    meta_model = get_config("embedding.meta")
    meta_map = get_config_map("models","name", meta_model)
    embd_map["base_url"] = meta_map["base_url"]
    embd_map["api_key"] = meta_map["api_key"]
    return embd_map

def crawler_interval():
    return get_config("crawler.interval")

def smtp_address():
    return get_config("smtp.email")

def smtp_pwd():
    return get_config("smtp.password")

def searx_engines():
    return get_config("searx.engines")
