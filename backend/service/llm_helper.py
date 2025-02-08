from operator import itemgetter
from typing import AsyncIterable

from langchain.callbacks import AsyncIteratorCallbackHandler
from langchain_core.chat_history import (
    BaseChatMessageHistory,
    InMemoryChatMessageHistory,
)
from langchain_core.messages import HumanMessage, trim_messages
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.runnables import RunnablePassthrough
from langchain_core.runnables.history import RunnableWithMessageHistory
from langchain_openai import ChatOpenAI, OpenAIEmbeddings

from backend.config.config import chat_model_meta, max_tokens


def get_trimmer(model):
    return trim_messages(
        max_tokens=max_tokens(),
        strategy="last",
        token_counter=model,
        include_system=True,
        allow_partial=False,
        start_on="human",
    )


class LLMHelper:
    def __init__(self):
        self.chat_model = chat_model_meta()
        self.prompt = ChatPromptTemplate.from_messages(
            [
                (
                    "system",
                    "You are a helpful assistant. Answer all questions to the best of your ability in {language}."
                ),
                MessagesPlaceholder(variable_name="messages"), ]
        )
        self.store = {}

    def get_session_history(self, session_id: str) -> BaseChatMessageHistory:
        if session_id not in self.store:
            self.store[session_id] = InMemoryChatMessageHistory()
        return self.store[session_id]

    def build_model(self, streaming=False, callbacks=None):
        if callbacks is None:
            callbacks = []
        return ChatOpenAI(
            streaming=streaming,
            callbacks=callbacks,
            model=self.chat_model["name"],
            base_url=self.chat_model["base_url"],
            api_key=self.chat_model["api_key"],
        )

    def build_embd(self):
        return OpenAIEmbeddings(
            model="text-embedding-ada-002",
            base_url=self.chat_model["base_url"],
            api_key=self.chat_model["api_key"],
        )

    def build_llm(self, streaming=False, callbacks=None):
        model = self.build_model(streaming, callbacks)
        trimmer = get_trimmer(model)

        chain = (
                RunnablePassthrough.assign(messages=itemgetter("messages") | trimmer)
                | self.prompt
                | model
        )

        return RunnableWithMessageHistory(
            chain,
            self.get_session_history,
            input_messages_key="messages",
        )

    def completions(self, message: str, session_id: str):
        config = {"configurable": {"session_id": session_id}}
        llm = self.build_llm()
        response = llm.invoke(
            {"messages": [HumanMessage(content=message)], "language": "Chinese"},
            config=config,
        )
        return response.content

    async def streaming(self, message: str, session_id: str) -> AsyncIterable[str]:
        config = {"configurable": {"session_id": session_id}}
        callback = AsyncIteratorCallbackHandler()
        llm = self.build_llm(streaming=True, callbacks=[callback])
        try:
            async for chunk in llm.astream(
                    {"messages": [HumanMessage(content=message)], "language": "Chinese"},
                    config=config
            ):
                yield chunk.content
        except Exception as e:
            yield f"LLM caught exception: {e}"
