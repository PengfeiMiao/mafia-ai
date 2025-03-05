from typing import Union, List, Any
from pydantic import BaseModel


class RagmapModel(BaseModel):
    id: Union[str, None] = None
    title: Union[str, None] = None
    rag_id: Union[str, None] = None
    resource_id: Union[str, None] = None
    type: Union[str, None] = None
