#!/bin/bash

# Development startup script
echo "Starting Blockchain Identity System in development mode..."

# Start local blockchain in background
echo "Starting local blockchain..."
cd contracts
npx hardhat node &
BLOCKCHAIN_PID=$!
cd ..

# Wait for blockchain to start
sleep 5

# Deploy contracts
echo "Deploying contracts..."
cd contracts
npx hardhat run scripts/deploy.js --network localhost
cd ..

# Start backend in background
echo "Starting backend server..."
cd backend
npm run dev &
BACKEND_PID=$!
cd ..

# Wait for backend to start
sleep 3

# Start frontend
echo "Starting frontend..."
cd frontend
npm start &
FRONTEND_PID=$!
cd ..

echo "All services started!"
echo "Blockchain PID: $BLOCKCHAIN_PID"
echo "Backend PID: $BACKEND_PID"
echo "Frontend PID: $FRONTEND_PID"
echo ""
echo "Frontend: http://localhost:3000"
echo "Backend: http://localhost:5000"
echo "Blockchain: http://localhost:8545"
echo ""
echo "Press Ctrl+C to stop all services"

# Function to cleanup on exit
cleanup() {
    echo "Stopping services..."
    kill $BLOCKCHAIN_PID 2>/dev/null
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    exit 0
}

# Set trap to cleanup on script exit
trap cleanup SIGINT SIGTERM

# Wait for user to stop
wait
