from typing import Union, List

from langchain_core.messages import SystemMessage, HumanMessage, AIMessage
from pydantic import BaseModel

from backend.model.attachment_model import AttachmentModel


class MessageModel(BaseModel):
    id: Union[str, None] = None
    session_id: Union[str, None] = None
    content: Union[str, None] = None
    type: Union[str, None] = None
    created_at: Union[str, None] = None
    attachments: Union[List[AttachmentModel], None] = None
    model: Union[str, None] = None
    rag_id: Union[str, None] = None
    mode: Union[str, None] = None

    def to_chat_messages(self):
        result = []
        if self.attachments is not None and len(self.attachments) > 0:
            attaches = []
            for item in self.attachments:
                if item.preview:
                    content = f"[filename]\n\n{item.file_name}\n\n[content]\n\n{item.preview}"
                    attaches.append(SystemMessage(content=content))
            result.extend(attaches)
        if self.type == 'user':
            result.append(HumanMessage(content=self.content))
        else:
            result.append(AIMessage(content=self.content))
        return result
