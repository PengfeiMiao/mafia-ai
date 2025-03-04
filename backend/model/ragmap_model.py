from typing import Union, List
from pydantic import BaseModel


class RagmapModel(BaseModel):
    id: Union[str, None] = None
    title: Union[str, None] = None
    resource_id: Union[str, None] = None
    type: Union[List[str], None] = None
    status: Union[str, None] = None
    created_at: Union[str, None] = None
    user_id: Union[str, None] = None
