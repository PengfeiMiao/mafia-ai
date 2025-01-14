from operator import itemgetter
from langchain_core.messages import HumanMessage, trim_messages
from langchain_core.runnables import RunnablePassthrough
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.chat_history import (
    BaseChatMessageHistory,
    InMemoryChatMessageHistory,
)
from langchain_core.runnables.history import RunnableWithMessageHistory
from backend.config.config import chat_model_meta


class LLMHelper:
    def __init__(self):
        chat_model= chat_model_meta()
        self.model = ChatOpenAI(
            model=chat_model["name"],
            base_url=chat_model["base_url"],
            api_key=chat_model["api_key"],
        )
        self.prompt = ChatPromptTemplate.from_messages(
            [
                (
                    "system",
                    "You are a helpful assistant. Answer all questions to the best of your ability in {language}."
                ),
                MessagesPlaceholder(variable_name="messages"), ]
        )

        self.trimmer = trim_messages(
            max_tokens=100,
            strategy="last",
            token_counter=self.model,
            include_system=True,
            allow_partial=False,
            start_on="human",
        )

        # parser = StrOutputParser()

        self.chain = (
                RunnablePassthrough.assign(messages=itemgetter("messages") | self.trimmer)
                | self.prompt
                | self.model
        )

        self.store = {}

        self.with_message_history = RunnableWithMessageHistory(
            self.chain,
            self.get_session_history,
            input_messages_key="messages",
        )

    def get_session_history(self, session_id: str) -> BaseChatMessageHistory:
        if session_id not in self.store:
            self.store[session_id] = InMemoryChatMessageHistory()
        return self.store[session_id]

    def completions(self, message:str, session_id:str):
        config = {"configurable": {"session_id": session_id}}
        response = self.with_message_history.invoke(
            {"messages": [HumanMessage(content=message)], "language": "Chinese"},
            config=config,
        )
        return response.content
