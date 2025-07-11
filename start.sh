#!/bin/bash

# Start FastAPI backend in background
echo "Starting FastAPI backend..."
python3 scripts/python-backend/app.py &

# Start frontend (Next.js) in foreground
echo "Starting Next.js frontend..."
# cd frontend
npm start
