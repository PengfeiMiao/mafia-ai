#!/bin/bash

source .profile
nohup python3 -m uvicorn backend.api:app --reload --host 0.0.0.0 >> app.log 2>&1 &
echo "start backend"

#cd client && nohup npm run prod >> app.log 2>&1 &
#echo "start client"
#
#until curl -sS "http://localhost:8000/login" | grep -q "Method Not Allowed"; do
#  sleep 1
#  echo -n "."
#done
#curl -X GET -H "Authorization: Bearer $SECRET_KEY" http://localhost:8000/db/init
#echo -e "\ninit database"

tail -f app.log