from enum import Enum

from langchain_core.prompts import ChatPromptTemplate
from langchain_openai.chat_models.base import BaseChatOpenAI


class RouterTypeEnum(str, Enum):
    normal = "normal"
    file_related = "file_related"


class Router:
    def __init__(self, model: BaseChatOpenAI):
        route_prompt = ChatPromptTemplate.from_messages([
            (
                "system", (
                    "Do NOT answer the following message as question directly."
                    "We need to define the type of the message."
                    "Must only return a single word from possible values below:"
                    "normal, file_related"
                )
            ),
            ("human", "{input}")
        ])
        self.route_chain = route_prompt | model

    def route(self, message: str):
        type_name = self.route_chain.invoke({"input": message}).content
        return RouterTypeEnum.__members__.get(type_name, RouterTypeEnum.normal)