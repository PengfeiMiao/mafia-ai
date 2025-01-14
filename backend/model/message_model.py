from typing import Union
from pydantic import BaseModel


class MessageModel(BaseModel):
    text: Union[str, None] = None
