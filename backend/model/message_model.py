from typing import Union
from pydantic import BaseModel


class MessageModel(BaseModel):
    id: Union[str, None] = None
    session_id: Union[str, None] = None
    content: Union[str, None] = None
    type: Union[str, None] = None
    created_at: Union[str, None] = None
