#!/bin/bash

# Start MongoDB
echo "Starting MongoDB..."
mongod --quiet --logpath /dev/null &

# Start Redis
echo "Starting Redis..."
redis-server --daemonize yes

# Wait for databases to be ready
sleep 5

# Start Backend
echo "Starting Backend Service..."
cd dropship-backend
npm start &

# Start Frontend
echo "Starting Frontend Service..."
cd ../dropship-frontend
npm start &

# Wait for all processes
wait
