from typing import Union
from pydantic import BaseModel


class AttachmentModel(BaseModel):
    id: Union[str, None] = None
    message_id: Union[str, None] = None
    session_id: Union[str, None] = None
    user_id: Union[str, None] = None
    file_name: Union[str, None] = None
    file_size: Union[int, None] = None
    preview: Union[str, None] = None
    status: Union[str, None] = None
    created_at: Union[str, None] = None
