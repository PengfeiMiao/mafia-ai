from pydantic import BaseModel


class UserModel(BaseModel):
    password: str
