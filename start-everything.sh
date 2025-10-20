#!/bin/bash

# Blockchain Identity System - Complete Startup Script (Linux/Mac)
# This script starts all services in the correct order

echo "🚀 Starting Blockchain Identity System..."
echo "==============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
NC='\033[0m' # No Color

# Function to check if a port is in use
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 0
    else
        return 1
    fi
}

# Function to wait for a service to be ready
wait_for_service() {
    local port=$1
    local service_name=$2
    local timeout=${3:-30}
    
    echo -e "${YELLOW}⏳ Waiting for $service_name to start on port $port...${NC}"
    
    for i in $(seq 1 $timeout); do
        if check_port $port; then
            echo -e "${GREEN}✅ $service_name is ready!${NC}"
            return 0
        fi
        sleep 2
    done
    
    echo -e "${RED}❌ $service_name failed to start within $timeout seconds${NC}"
    return 1
}

# Function to kill existing processes
stop_existing_services() {
    echo -e "${YELLOW}🛑 Stopping existing services...${NC}"
    
    # Kill existing Node.js processes
    pkill -f "node" 2>/dev/null || true
    
    # Kill processes using our ports
    for port in 3000 5000 8545; do
        lsof -ti:$port | xargs kill -9 2>/dev/null || true
    done
    
    sleep 2
}

# Function to check dependencies
check_dependencies() {
    echo -e "${YELLOW}🔍 Checking dependencies...${NC}"
    
    # Check if Node.js is installed
    if ! command -v node &> /dev/null; then
        echo -e "${RED}❌ Node.js is not installed. Please install Node.js first.${NC}"
        exit 1
    fi
    
    # Check if npm is available
    if ! command -v npm &> /dev/null; then
        echo -e "${RED}❌ npm is not available. Please install npm first.${NC}"
        exit 1
    fi
    
    # Check if we're in the right directory
    if [ ! -f "package.json" ]; then
        echo -e "${RED}❌ Please run this script from the project root directory.${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ All dependencies are available${NC}"
}

# Function to install dependencies if needed
install_dependencies() {
    echo -e "${YELLOW}📦 Installing dependencies...${NC}"
    
    # Install root dependencies
    if [ ! -d "node_modules" ]; then
        echo -e "${CYAN}Installing root dependencies...${NC}"
        npm install
    fi
    
    # Install contract dependencies
    if [ ! -d "contracts/node_modules" ]; then
        echo -e "${CYAN}Installing contract dependencies...${NC}"
        cd contracts
        npm install
        cd ..
    fi
    
    # Install backend dependencies
    if [ ! -d "backend/node_modules" ]; then
        echo -e "${CYAN}Installing backend dependencies...${NC}"
        cd backend
        npm install
        cd ..
    fi
    
    # Install frontend dependencies
    if [ ! -d "frontend/node_modules" ]; then
        echo -e "${CYAN}Installing frontend dependencies...${NC}"
        cd frontend
        npm install
        cd ..
    fi
    
    echo -e "${GREEN}✅ All dependencies installed${NC}"
}

# Function to start blockchain node
start_blockchain_node() {
    echo -e "${YELLOW}🔗 Starting blockchain node...${NC}"
    
    cd contracts
    npx hardhat node &
    BLOCKCHAIN_PID=$!
    cd ..
    
    # Wait for blockchain to be ready
    if wait_for_service 8545 "Blockchain Node" 30; then
        echo -e "${GREEN}✅ Blockchain node started successfully${NC}"
        return 0
    else
        echo -e "${RED}❌ Failed to start blockchain node${NC}"
        kill $BLOCKCHAIN_PID 2>/dev/null || true
        exit 1
    fi
}

# Function to deploy contracts
deploy_contracts() {
    echo -e "${YELLOW}📄 Deploying smart contracts...${NC}"
    
    cd contracts
    
    # Compile contracts
    echo -e "${CYAN}Compiling contracts...${NC}"
    npx hardhat compile
    
    # Deploy contracts
    echo -e "${CYAN}Deploying contracts...${NC}"
    npx hardhat run scripts/deploy.js --network localhost
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Contracts deployed successfully${NC}"
    else
        echo -e "${RED}❌ Failed to deploy contracts${NC}"
        cd ..
        exit 1
    fi
    
    cd ..
}

# Function to start backend server
start_backend_server() {
    echo -e "${YELLOW}🔧 Starting backend server...${NC}"
    
    cd backend
    npm run dev &
    BACKEND_PID=$!
    cd ..
    
    # Wait for backend to be ready
    if wait_for_service 5000 "Backend Server" 30; then
        echo -e "${GREEN}✅ Backend server started successfully${NC}"
        return 0
    else
        echo -e "${RED}❌ Failed to start backend server${NC}"
        kill $BACKEND_PID 2>/dev/null || true
        exit 1
    fi
}

# Function to start frontend application
start_frontend_app() {
    echo -e "${YELLOW}🎨 Starting frontend application...${NC}"
    
    cd frontend
    npm start &
    FRONTEND_PID=$!
    cd ..
    
    # Wait for frontend to be ready
    if wait_for_service 3000 "Frontend App" 60; then
        echo -e "${GREEN}✅ Frontend application started successfully${NC}"
        return 0
    else
        echo -e "${RED}❌ Failed to start frontend application${NC}"
        kill $FRONTEND_PID 2>/dev/null || true
        exit 1
    fi
}

# Function to display system status
show_system_status() {
    echo ""
    echo -e "${GREEN}🎉 SYSTEM STARTUP COMPLETE!${NC}"
    echo "==============================================="
    echo ""
    echo -e "${CYAN}🌐 Access Points:${NC}"
    echo -e "   Frontend:    http://localhost:3000"
    echo -e "   Backend API: http://localhost:5000"
    echo -e "   Blockchain:  http://localhost:8545"
    echo ""
    echo -e "${CYAN}🔑 Test Account (for MetaMask):${NC}"
    echo -e "   Address: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
    echo -e "   Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"
    echo ""
    echo -e "${CYAN}📱 Next Steps:${NC}"
    echo -e "   1. Open http://localhost:3000 in your browser"
    echo -e "   2. Connect MetaMask to localhost:8545"
    echo -e "   3. Import the test account using the private key above"
    echo -e "   4. Start using the Blockchain Identity System!"
    echo ""
    echo -e "${YELLOW}⚠️  To stop all services, press Ctrl+C${NC}"
    echo ""
}

# Function to handle cleanup on exit
cleanup() {
    echo ""
    echo -e "${YELLOW}🛑 Stopping all services...${NC}"
    
    # Kill all background processes
    kill $BLOCKCHAIN_PID $BACKEND_PID $FRONTEND_PID 2>/dev/null || true
    
    # Kill any remaining Node.js processes
    pkill -f "node" 2>/dev/null || true
    
    echo -e "${GREEN}✅ All services stopped${NC}"
    exit 0
}

# Set up cleanup handler
trap cleanup SIGINT SIGTERM

# Main execution
main() {
    # Step 1: Check dependencies
    check_dependencies
    
    # Step 2: Stop existing services
    stop_existing_services
    
    # Step 3: Install dependencies
    install_dependencies
    
    # Step 4: Start blockchain node
    start_blockchain_node
    
    # Step 5: Deploy contracts
    deploy_contracts
    
    # Step 6: Start backend server
    start_backend_server
    
    # Step 7: Start frontend application
    start_frontend_app
    
    # Step 8: Show system status
    show_system_status
    
    # Keep script running and monitor services
    echo -e "${YELLOW}🔄 Monitoring services... (Press Ctrl+C to stop)${NC}"
    
    while true; do
        sleep 10
        
        # Check if services are still running
        if ! check_port 8545; then
            echo -e "${RED}⚠️  Blockchain node stopped unexpectedly${NC}"
        fi
        if ! check_port 5000; then
            echo -e "${RED}⚠️  Backend server stopped unexpectedly${NC}"
        fi
        if ! check_port 3000; then
            echo -e "${RED}⚠️  Frontend app stopped unexpectedly${NC}"
        fi
    done
}

# Run main function
main
