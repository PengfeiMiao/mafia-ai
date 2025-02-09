# Mafia AI in python

## Tech Stack
- fastapi
- langchain
- postgres
- react

## Quick Start
1. install requirement <br>
   `pip install -r backend/requirements.txt` <br>
   use image: <br>
   `pip install -r backend/requirements.txt -i https://pypi.tuna.tsinghua.edu.cn/simple`
2. install possible-needed os lib for langchain unstructured
   - libmagic
   - poppler
   - tesseract
2. start database <br>
   `docker-compose up -d`
3. start backend api <br>
   `python3 -m uvicorn backend.api:app --reload --host 0.0.0.0 --port 8000`
4. install npm dependencies <br>
   `nvm use 20` - switch node to 20 <br>
   `cd client && npm install`
5. start client <br>
   `npm run dev`

## Iteration Plan
1. 基本问答 - completed
2. 会话管理
3. 文档解析，RAG 知识库
4. Web 深度搜索
5. Web 热搜