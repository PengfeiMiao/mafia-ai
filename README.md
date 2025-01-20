# Mafia AI in python

## Tech Stack
- fastapi
- langchain
- postgres
- react

## Quick Start
1. install requirement
   `pip install -r backend/requirements.txt`
2. start database <br>
   `docker-compose up -d`
3. start backend api
   `python3 -m uvicorn backend.api:app --reload --host 0.0.0.0 --port 8000`

## Iteration Plan
1. 基本问答 - completed
2. 会话管理
3. 文档解析，RAG 知识库
4. Web 深度搜索
5. Web 热搜