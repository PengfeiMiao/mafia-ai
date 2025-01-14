# Mafia AI in python

## Tech Stack
- fastapi
- langchain
- postgres

## Quick Start
1. install requirement
   `pip install -r backend/requirements.txt`
2. start database <br>
   `docker-compose up -d`
3. start backend api
   `python3 -m uvicorn backend.api:app --reload --host 0.0.0.0 --port 8000`