from typing import Union, List
from pydantic import BaseModel


class WebsiteModel(BaseModel):
    id: Union[str, None] = None
    title: Union[str, None] = None
    uri: Union[str, None] = None
    xpaths: Union[List[str], None] = None
    scheduled: Union[bool, None] = None
    cron: Union[str, None] = None
    preview: Union[List[str], None] = None
    status: Union[str, None] = None
    created_at: Union[str, None] = None
    user_id: Union[str, None] = None
