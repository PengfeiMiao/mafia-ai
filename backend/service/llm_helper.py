from collections import defaultdict
from operator import itemgetter
from typing import AsyncIterable, List

import bs4
from langchain.callbacks import AsyncIteratorCallbackHandler
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain.chains.history_aware_retriever import create_history_aware_retriever
from langchain.chains.retrieval import create_retrieval_chain
from langchain_chroma import Chroma
from langchain_community.document_loaders import WebBaseLoader
from langchain_core.chat_history import (
    BaseChatMessageHistory,
    InMemoryChatMessageHistory,
)
from langchain_core.messages import trim_messages, BaseMessage
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.runnables import RunnablePassthrough
from langchain_core.runnables.history import RunnableWithMessageHistory
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_unstructured import UnstructuredLoader

from backend.config.config import chat_model_meta, max_tokens as max_token_config, embd_dir, embd_model
from backend.service.router import Router


def get_trimmer(model):
    return trim_messages(
        max_tokens=max_token_config(),
        strategy="last",
        token_counter=model,
        include_system=True,
        allow_partial=False,
        start_on="human",
    )


def get_session_config(session_id: str):
    return {"configurable": {"session_id": session_id}}


def format_docs(_docs):
    _docs_by_source = defaultdict(list)

    for _doc in _docs:
        source = _doc.metadata.get('source')
        if source is not None:
            _docs_by_source[source].append(_doc)

    merged_docs = []
    for _, _docs in _docs_by_source.items():
        first_doc = _docs[0]
        merged_page_content = '\n\n'.join([doc.page_content for doc in _docs])
        first_doc.page_content = merged_page_content

        for key, value in list(first_doc.metadata.items()):
            if isinstance(value, list):
                first_doc.metadata[key] = ','.join(map(str, value))

        merged_docs.append(first_doc)

    return merged_docs


def parse_docs(file_paths: List[str]):
    loader = UnstructuredLoader(file_paths)
    docs = loader.load()
    return format_docs(docs)


def parse_html(urls: List[str]):
    loader = WebBaseLoader(
        web_paths=urls,
        bs_kwargs=dict(
            parse_only=bs4.SoupStrainer(['div', 'p'])
        ),
    )
    docs = loader.load()
    return format_docs(docs)


class LLMHelper:
    def __init__(self):
        self.chat_model = chat_model_meta()
        self.prompt = ChatPromptTemplate.from_messages(
            [
                (
                    "system",
                    "You are a helpful assistant. Answer all questions to the best of your ability in Chinese."
                ),
                MessagesPlaceholder("chat_history"),
                ("system", (
                    "If exist any more context, input it here: "
                    "\n\n"
                    "{preview}"
                    "\n\n"
                    "If it's None, please ignore."
                )),
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
                    "You are an assistant for question-answering tasks in Chinese. "
                    "Use the following pieces of retrieved context to answer the question. "
                    "If you don't know the answer, say that you don't know. "
                    "Use three sentences maximum and keep the answer concise. "
                    "\n\n"
                    "{context}"
                )),
                MessagesPlaceholder("chat_history"),
                ("system", (
                    "If exist any more context, input it here: "
                    "\n\n"
                    "{preview}"
                    "\n\n"
                    "If it's None, please ignore."
                )),
                ("human", "{input}"),
            ]
        )
        self.store = {}
        self.vectorstore = Chroma(persist_directory=embd_dir(), embedding_function=OpenAIEmbeddings(
            model=embd_model(),
            base_url=self.chat_model["base_url"],
            api_key=self.chat_model["api_key"],
        ))

    def init_session_history(self, session_history: dict):
        for session_id, history in session_history.items():
            if session_id not in self.store:
                chat_history = []
                for item in history:
                    chat_history.extend(item.to_chat_messages())
                self.store[session_id] = InMemoryChatMessageHistory(messages=chat_history)

    def get_session_history(self, session_id: str) -> BaseChatMessageHistory:
        if session_id not in self.store:
            self.store[session_id] = InMemoryChatMessageHistory()
        return self.store[session_id]

    def build_model(self, streaming=False, callbacks=None, temperature=0.8, max_tokens=None):
        if callbacks is None:
            callbacks = []
        return ChatOpenAI(
            streaming=streaming,
            callbacks=callbacks,
            model=self.chat_model["name"],
            base_url=self.chat_model["base_url"],
            api_key=self.chat_model["api_key"],
            temperature=temperature,
            max_tokens=max_tokens
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

    def append_docs(self, file_paths: List[str]):
        text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
        documents = parse_docs(file_paths)
        splits = text_splitter.split_documents(documents)
        self.vectorstore.add_documents(documents=splits)
        return documents

    def route(self, message: str):
        model = self.build_model(temperature=0.1, max_tokens=50)
        router = Router(model=model)
        return router.route(message=message)

    def completions(self, message: str, session_id: str):
        config = get_session_config(session_id)
        llm = self.build_llm()
        response = llm.invoke({"input": message}, config=config)
        return response.content

    async def streaming(self, message: str, session_id: str, files=None) -> AsyncIterable[str]:
        pre_input = None
        if files:
            previews = ""
            for key, value in files.items():
                previews += f"\n\n filename: {key} \n\n content: {value}"
            pre_input = f"These source files are attached to the context: {previews}. "
        config = get_session_config(session_id)
        callback = AsyncIteratorCallbackHandler()
        llm = self.build_llm(streaming=True, callbacks=[callback])
        try:
            async for chunk in llm.astream({"input": message, "preview": pre_input}, config=config):
                # print(chunk)
                if isinstance(chunk, dict) and chunk.get("answer"):
                    yield chunk["answer"]
                elif isinstance(chunk, BaseMessage):
                    yield chunk.content
        except Exception as e:
            yield f"LLM caught exception: {e}"
