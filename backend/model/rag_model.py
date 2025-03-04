from typing import Union, List
from pydantic import BaseModel

from backend.model.ragmap_model import RagmapModel


class RagModel(BaseModel):
    id: Union[str, None] = None
    title: Union[str, None] = None
    resources: Union[List[RagmapModel], None] = None
    status: Union[str, None] = None
    created_at: Union[str, None] = None
    user_id: Union[str, None] = None
