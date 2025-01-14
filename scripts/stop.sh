#!/bin/bash

function kill_process_on_port {
  local port=$1
  # shellcheck disable=SC2155
  local pids=$(lsof -t -i :"$port")

  if [ -n "$pids" ]; then
    echo "process using $port: $pids"
    for pid in $pids; do
      echo "process is killed: $pid"
      kill -9 "$pid"
    done
    echo "process has been killed"
  else
    echo "process using $port not found"
  fi
}

kill_process_on_port "8000"
kill_process_on_port "3001"