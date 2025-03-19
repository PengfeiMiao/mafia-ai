from typing import Union

from pydantic import BaseModel


class UserModel(BaseModel):
    id: Union[str, None] = None
    email: Union[str, None] = None
    code: Union[str, None] = None
    username: str
    password: str
