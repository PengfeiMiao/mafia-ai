from typing import Union, List
from pydantic import BaseModel

from backend.model.attachment_model import AttachmentModel


class MessageModel(BaseModel):
    id: Union[str, None] = None
    session_id: Union[str, None] = None
    content: Union[str, None] = None
    type: Union[str, None] = None
    created_at: Union[str, None] = None
    attachments: Union[List[AttachmentModel], None] = None
