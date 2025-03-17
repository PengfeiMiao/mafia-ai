import json
import time
from collections import defaultdict
from operator import itemgetter
from typing import AsyncIterable, List, Union

import bs4
from langchain.callbacks import AsyncIteratorCallbackHandler
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain.chains.history_aware_retriever import create_history_aware_retriever
from langchain.chains.retrieval import create_retrieval_chain
from langchain_chroma import Chroma
from langchain_community.document_loaders import WebBaseLoader
from langchain_community.utilities import SearxSearchWrapper
from langchain_core.chat_history import (
    BaseChatMessageHistory,
    InMemoryChatMessageHistory,
)
from langchain_core.documents import Document
from langchain_core.messages import trim_messages, BaseMessage
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.runnables import RunnablePassthrough
from langchain_core.runnables.history import RunnableWithMessageHistory
from langchain_deepseek import ChatDeepSeek
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_unstructured import UnstructuredLoader

from backend.config.config import chat_model_meta, max_tokens as max_token_config, embd_model_meta, max_histories, \
    get_config_map, searx_engines, searx_limit
from backend.service.router import Router
from backend.util.common import remove_blank_lines


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


def format_doc(source, content):
    return f"source: {source} \n\n content: {content} \n\n"


def format_docs(_docs):
    _docs_by_source = defaultdict(list)

    for _doc in _docs:
        source = _doc.metadata.get('source')
        if source is not None:
            _docs_by_source[source].append(_doc)

    merged_docs = []
    for _source, _docs in _docs_by_source.items():
        first_doc = _docs[0]
        merged_page_content = '\n\n'.join([doc.page_content for doc in _docs])
        first_doc.page_content = format_doc(_source, merged_page_content)

        for key, value in list(first_doc.metadata.items()):
            try:
                if not isinstance(value, (str, int, float, bool)):
                    first_doc.metadata[key] = json.dumps(value)
            except RuntimeError:
                first_doc.metadata[key] = None

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
        self.embd_model = embd_model_meta()
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
        self.vectorstore = {}
        self.searx_search = SearxSearchWrapper(searx_host="http://localhost:8001")
        self.searx_engines = searx_engines()
        self.searx_limit = searx_limit()

    def searx_query(self, query, engines: Union[List[str], None] = None, limit = None):
        results = []
        if not engines:
            engines = self.searx_engines
        if not limit:
            limit = self.searx_limit
        for engine in engines:
            result = self.searx_search.results(query, num_results=limit, engines=[engine])
            results.extend([item for item in result if item.get('snippet')])
        return results

    def init_session_history(self, session_history: dict):
        for session_id, history in session_history.items():
            if session_id not in self.store:
                chat_history = []
                for item in history[-max_histories():]:
                    chat_history.extend(item.to_chat_messages())
                self.store[session_id] = InMemoryChatMessageHistory(messages=chat_history)

    def get_session_history(self, session_id: str) -> BaseChatMessageHistory:
        if session_id not in self.store:
            self.store[session_id] = InMemoryChatMessageHistory()
        chat_memory: InMemoryChatMessageHistory = self.store[session_id]
        chat_history = list(chat_memory.messages)[-max_histories():]
        chat_memory.clear()
        chat_memory.add_messages(chat_history)

        return chat_memory

    def clean_session_history(self, session_id: str):
        if session_id in self.store:
            self.store[session_id] = InMemoryChatMessageHistory()

    def build_model(self, streaming=False, callbacks=None, temperature=0.8, max_tokens=None, model_name=None):
        if callbacks is None:
            callbacks = []
        chat_model = get_config_map("models", "name", model_name) if model_name else self.chat_model
        # print('chat_model', chat_model)
        model_type = chat_model["type"]
        if model_type == "deepseek":
            model = ChatDeepSeek(
                streaming=streaming,
                callbacks=callbacks,
                model=chat_model["name"],
                base_url=chat_model["base_url"],
                api_key=chat_model["api_key"],
                temperature=temperature,
                max_tokens=max_tokens,
                max_retries=2
            )
        else:
            model = ChatOpenAI(
                streaming=streaming,
                callbacks=callbacks,
                model=chat_model["name"],
                base_url=chat_model["base_url"],
                api_key=chat_model["api_key"],
                temperature=temperature,
                max_tokens=max_tokens
            )

        return model

    def build_vectorstore(self, collection) -> Chroma:
        if collection not in self.vectorstore:
            self.vectorstore[collection] = Chroma(
                collection_name=collection,
                persist_directory=self.embd_model["persist_dir"],
                embedding_function=OpenAIEmbeddings(
                    model=self.embd_model["model"],
                    base_url=self.embd_model["base_url"],
                    api_key=self.embd_model["api_key"],
                )
            )
        return self.vectorstore[collection]

    def build_rag(self, streaming=False, callbacks=None, rag_id=None, model_name=None):
        retriever = self.build_vectorstore(rag_id if rag_id else "default").as_retriever()
        model = self.build_model(streaming, callbacks, model_name=model_name)
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

    def build_llm(self, streaming=False, callbacks=None, model_name=None):
        model = self.build_model(streaming, callbacks, model_name=model_name)
        # trimmer = get_trimmer(model)

        chain = (
                RunnablePassthrough.assign(messages=itemgetter("chat_history"))
                | self.prompt
                | model
        )

        return RunnableWithMessageHistory(
            chain,
            self.get_session_history,
            input_messages_key="input",
            history_messages_key="chat_history",
        )

    def append_docs(self, collection: str, documents: List[Document]):
        text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
        splits = text_splitter.split_documents(documents)
        self.build_vectorstore(collection).add_documents(documents=splits)
        return documents

    def reset_rag_store(self, collection: str):
        self.build_vectorstore(collection).reset_collection()

    def append_texts(self, collection: str, dicts: dict):
        documents = [
            Document(page_content=format_doc(key, value), metadata={"source": key}, )
            for key, value in dicts.items()
        ]
        self.append_docs(collection, documents=documents)

    def route(self, message: str):
        model = self.build_model(temperature=0.1, max_tokens=50)
        router = Router(model=model)
        return router.route(message=message)

    def completions(self, message: str, session_id: str):
        config = get_session_config(session_id)
        llm = self.build_llm()
        response = llm.invoke({"input": message, "preview": None}, config=config)
        return response.content

    async def streaming(self, message: str, session_id: str,
                        model=None, rag_id=None, files=None, mode=None) -> AsyncIterable[dict]:
        pre_input = None
        if files:
            previews = ""
            for key, value in files.items():
                previews += format_doc(key, value)
            pre_input = f"These source files are attached to the context: \n\n {previews}. \n\n"
        config = get_session_config(session_id)
        callback = AsyncIteratorCallbackHandler()
        llm = self.build_rag(streaming=True, callbacks=[callback], rag_id=rag_id, model_name=model) \
            if rag_id else self.build_llm(streaming=True, callbacks=[callback], model_name=model)
        if mode and 'web' in mode:
            results = self.searx_query(message)
            yield {'content': results, 'type': 'web'}
            urls = list(set([result.get('link') for result in results]))
            snippets = list(set([result.get('snippet') for result in results]))
            webs = parse_html(urls=urls)
            preview = '\n\n'.join(snippets + [remove_blank_lines(web.page_content[:2000]) for web in webs])
            pre_input = "" if not pre_input else pre_input
            pre_input += f"These source webs are attached to the context: \n\n {preview}. \n\n"
            print('pre_input: ', pre_input)
        try:
            async for chunk in llm.astream({"input": message, "preview": pre_input}, config=config):
                if isinstance(chunk, dict) and chunk.get("answer"):
                    yield {'content': chunk["answer"], 'type': 'msg'}
                elif isinstance(chunk, BaseMessage):
                    yield {'content': chunk.content, 'type': 'msg'}
        except Exception as e:
            yield f"LLM caught exception: {e}"


if __name__ == '__main__':
    llm_helper = LLMHelper()
    _rag_id = "default"
    # t = time.time()
    # llm_helper.reset_rag_store(_rag_id)
    # llm_helper.append_texts(_rag_id, {"电影《哪吒2》": "请回答我：它是国产动漫之光！"})
    # print('append_texts use: ', time.time() - t)
    t = time.time()
    # _llm = llm_helper.build_rag(streaming=False, rag_id=_rag_id, model_name="deepseek-chat")
    _llm = llm_helper.build_llm(streaming=False, model_name="deepseek-chat")
    print('build model use: ', time.time() - t)
    t = time.time()
    for _chunk in _llm.stream({"input": "哪吒2 是什么", "preview": None}, config=get_session_config(_rag_id)):
        print(_chunk)
        print('chunk use: ', time.time() - t)
        t = time.time()
