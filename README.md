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
3. start database <br>
   `docker-compose up -d`
4. start backend api <br>
   `python -m uvicorn backend.api:app --reload --host 0.0.0.0 --port 8000`
5. install npm dependencies <br>
   `nvm use 20` - switch node to 20 <br>
   `cd client && npm install`
6. start client <br>
   `npm run dev`

## Iteration Plan
1. 基本问答 - completed
2. 会话管理 - completed
3. 文档解析 - completed [todo: 考虑接入 elasticsearch]
4. RAG 知识库 - WIP
5. Web 深度搜索 - WIP
6. Web 热搜
7. 用户管理
8. 接入微调模型
9. 自定义小应用
10. 盈利模式 - 接入 QQ，Mail，短信，微信小程序