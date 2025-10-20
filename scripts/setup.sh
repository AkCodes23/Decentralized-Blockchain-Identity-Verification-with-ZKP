#!/bin/bash

# Setup script for Blockchain Identity System
echo "Setting up Blockchain Identity System..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "npm is not installed. Please install npm first."
    exit 1
fi

# Install dependencies
echo "Installing dependencies..."
npm install

# Install backend dependencies
echo "Installing backend dependencies..."
cd backend
npm install
cd ..

# Install frontend dependencies
echo "Installing frontend dependencies..."
cd frontend
npm install
cd ..

# Install contract dependencies
echo "Installing contract dependencies..."
cd contracts
npm install
cd ..

# Create .env files
echo "Creating environment files..."
cp backend/.env.example backend/.env

# Make scripts executable
chmod +x scripts/*.sh
chmod +x zkp/setup_circuits.sh

echo "Setup completed successfully!"
echo ""
echo "Next steps:"
echo "1. Configure your .env file in the backend directory"
echo "2. Start the local blockchain: npm run contracts:node"
echo "3. Deploy contracts: npm run contracts:deploy"
echo "4. Start the backend: npm run backend:dev"
echo "5. Start the frontend: npm run frontend:dev"
echo ""
echo "For more information, see the README.md file."
