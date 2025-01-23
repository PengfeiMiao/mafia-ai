from typing import Union
from pydantic import BaseModel


class SessionModel(BaseModel):
    id: Union[str, None] = None
    user_id: Union[str, None] = None
    title: Union[str, None] = None
    status: Union[str, None] = None
    created_at: Union[str, None] = None
