#!/bin/bash

nohup python3 -m uvicorn backend.api:app --reload --host 0.0.0.0 --port 8000 >> app.log 2>&1 &
echo "start backend"

cd client && nohup npm run prod >> app.log 2>&1 &
echo "start client"

tail -f app.log