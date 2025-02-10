from enum import Enum

from langchain_core.prompts import ChatPromptTemplate
from langchain_openai.chat_models.base import BaseChatOpenAI


class RouterTypeEnum(str, Enum):
    normal = "normal"
    file_analyze = "file-analyze"
    file_compare = "file-compare"


class Router:
    def __init__(self, model: BaseChatOpenAI):
        route_prompt = ChatPromptTemplate.from_messages([
            (
                "system", (
                    "Do NOT answer the following message as question directly."
                    "We need to define the type of the message, default type is 'normal'."
                    "Must only return a single word from possible values below:"
                    "normal, file-analyse, file-compare"
                )
            ),
            ("human", "{input}")
        ])
        self.route_chain = route_prompt | model

    def route(self, message: str):
        type_name = self.route_chain.invoke({"input": message}).content
        try:
            router_type = RouterTypeEnum[type_name]
        except KeyError:
            router_type = RouterTypeEnum.normal
        return router_type