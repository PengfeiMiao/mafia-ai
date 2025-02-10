from operator import itemgetter
from typing import AsyncIterable

from langchain.callbacks import AsyncIteratorCallbackHandler
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain.chains.history_aware_retriever import create_history_aware_retriever
from langchain.chains.retrieval import create_retrieval_chain
from langchain_chroma import Chroma
from langchain_core.chat_history import (
    BaseChatMessageHistory,
    InMemoryChatMessageHistory,
)
from langchain_core.messages import trim_messages, BaseMessage
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.runnables import RunnablePassthrough
from langchain_core.runnables.history import RunnableWithMessageHistory
from langchain_openai import ChatOpenAI, OpenAIEmbeddings

from backend.config.config import chat_model_meta, max_tokens, embd_dir, embd_model


def get_trimmer(model):
    return trim_messages(
        max_tokens=max_tokens(),
        strategy="last",
        token_counter=model,
        include_system=True,
        allow_partial=False,
        start_on="human",
    )


def get_session_config(session_id: str):
    return {"configurable": {"session_id": session_id}}


class LLMHelper:
    def __init__(self):
        self.chat_model = chat_model_meta()
        self.prompt = ChatPromptTemplate.from_messages(
            [
                (
                    "system",
                    "You are a helpful assistant. Answer all questions to the best of your ability."
                ),
                MessagesPlaceholder("chat_history"),
                ("human", "{input}"),
            ]
        )
        self.contextualize_q_prompt = ChatPromptTemplate.from_messages(
            [
                ("system", (
                    "Given a chat history and the latest user question which might reference context in the chat history, "
                    "formulate a standalone question which can be understood without the chat history. "
                    "Do NOT answer the question, just reformulate it if needed and otherwise return it as is."
                )),
                MessagesPlaceholder("chat_history"),
                ("human", "{input}"),
            ]
        )
        self.qa_prompt = ChatPromptTemplate.from_messages(
            [
                ("system", (
                    "You are an assistant for question-answering tasks. "
                    "Use the following pieces of retrieved context to answer the question. "
                    "If you don't know the answer, say that you don't know. "
                    "Use three sentences maximum and keep the answer concise. "
                    "\n\n"
                    "{context}"
                )),
                MessagesPlaceholder("chat_history"),
                ("human", "{input}"),
            ]
        )
        self.store = {}
        self.vectorstore = Chroma(persist_directory=embd_dir(), embedding_function=OpenAIEmbeddings(
            model=embd_model(),
            base_url=self.chat_model["base_url"],
            api_key=self.chat_model["api_key"],
        ))

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

    def build_rag(self, streaming=False, callbacks=None):
        retriever = self.vectorstore.as_retriever()
        model = self.build_model(streaming, callbacks)
        history_aware_retriever = create_history_aware_retriever(
            model, retriever, self.contextualize_q_prompt
        )
        qa_chain = create_stuff_documents_chain(model, self.qa_prompt)
        rag_chain = create_retrieval_chain(history_aware_retriever, qa_chain)
        return RunnableWithMessageHistory(
            rag_chain,
            self.get_session_history,
            input_messages_key="input",
            history_messages_key="chat_history",
            output_messages_key="answer",
        )

    def build_llm(self, streaming=False, callbacks=None):
        model = self.build_model(streaming, callbacks)
        trimmer = get_trimmer(model)

        chain = (
                RunnablePassthrough.assign(messages=itemgetter("chat_history") | trimmer)
                | self.prompt
                | model
        )

        return RunnableWithMessageHistory(
            chain,
            self.get_session_history,
            input_messages_key="input",
            history_messages_key="chat_history",
        )

    def completions(self, message: str, session_id: str):
        config = get_session_config(session_id)
        llm = self.build_llm()
        response = llm.invoke({"input": message}, config=config)
        return response.content

    async def streaming(self, message: str, session_id: str) -> AsyncIterable[str]:
        config = get_session_config(session_id)
        callback = AsyncIteratorCallbackHandler()
        llm = self.build_rag(streaming=True, callbacks=[callback])
        try:
            async for chunk in llm.astream({"input": message}, config=config):
                print(chunk)
                if isinstance(chunk, dict) and chunk.get("answer"):
                    yield chunk["answer"]
                elif isinstance(chunk, BaseMessage):
                    yield chunk.content
        except Exception as e:
            yield f"LLM caught exception: {e}"
