# 🚀 Single Script Startup Guide

## Overview

I've created comprehensive single scripts that start the entire Blockchain Identity System with one command. These scripts handle everything automatically:

- ✅ Dependency checking and installation
- ✅ Service cleanup and port management
- ✅ Blockchain node startup
- ✅ Smart contract deployment
- ✅ Backend server startup
- ✅ Frontend application startup
- ✅ Service monitoring and health checks
- ✅ Graceful shutdown handling

## 🎯 **Quick Start**

### For Windows (PowerShell):
```powershell
.\start-everything.ps1
```

### For Windows (Command Prompt):
```cmd
start-everything.bat
```

### For Linux/Mac (Bash):
```bash
./start-everything.sh
```

## 📋 **What the Scripts Do**

### 1. **Pre-flight Checks**
- ✅ Verify Node.js and npm are installed
- ✅ Check if running from correct directory
- ✅ Stop any existing services on ports 3000, 5000, 8545

### 2. **Dependency Management**
- ✅ Install root project dependencies
- ✅ Install contract dependencies (Hardhat, OpenZeppelin)
- ✅ Install backend dependencies (Express, Web3, etc.)
- ✅ Install frontend dependencies (React, ethers.js, etc.)

### 3. **Service Startup (In Order)**
- ✅ **Blockchain Node**: Start Hardhat local network on port 8545
- ✅ **Contract Deployment**: Compile and deploy all smart contracts
- ✅ **Backend Server**: Start Express.js API on port 5000
- ✅ **Frontend App**: Start React development server on port 3000

### 4. **Health Monitoring**
- ✅ Continuous monitoring of all services
- ✅ Automatic detection of service failures
- ✅ Graceful shutdown on Ctrl+C

## 🌐 **Access Points**

Once the script completes, you can access:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Blockchain**: http://localhost:8545

## 🔑 **Test Account**

The script provides a test account for MetaMask:

```
Address: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
```

## 📱 **Usage Instructions**

1. **Run the Script**: Execute the appropriate script for your platform
2. **Wait for Completion**: The script will show progress and confirm when ready
3. **Open Browser**: Navigate to http://localhost:3000
4. **Connect MetaMask**: 
   - Add localhost:8545 as a custom network
   - Import the test account using the private key
5. **Start Using**: Create identities, issue credentials, and verify with ZKP!

## 🛠️ **Troubleshooting**

### Common Issues:

1. **Port Already in Use**
   - The script automatically kills existing processes
   - If issues persist, manually kill processes: `taskkill /f /im node.exe` (Windows)

2. **Dependencies Not Installing**
   - Ensure you have Node.js 16+ installed
   - Check internet connection
   - Try running `npm install` manually in each directory

3. **Contracts Not Deploying**
   - Ensure blockchain node is running
   - Check if ports 8545 is available
   - Verify Hardhat configuration

4. **Services Not Starting**
   - Check if ports 3000, 5000, 8545 are available
   - Ensure no firewall blocking
   - Check system resources (RAM, CPU)

### Manual Fallback:

If the script fails, you can start services manually:

```bash
# Terminal 1: Blockchain
cd contracts
npx hardhat node

# Terminal 2: Deploy Contracts
cd contracts
npx hardhat run scripts/deploy.js --network localhost

# Terminal 3: Backend
cd backend
npm run dev

# Terminal 4: Frontend
cd frontend
npm start
```

## 🔧 **Script Features**

### Windows PowerShell Script (`start-everything.ps1`)
- ✅ Full PowerShell implementation
- ✅ Background job management
- ✅ Service health monitoring
- ✅ Graceful error handling
- ✅ Color-coded output

### Windows Batch Script (`start-everything.bat`)
- ✅ Simple batch file wrapper
- ✅ Calls PowerShell script
- ✅ Cross-compatibility

### Linux/Mac Bash Script (`start-everything.sh`)
- ✅ Full bash implementation
- ✅ Process management with PIDs
- ✅ Signal handling (SIGINT, SIGTERM)
- ✅ Cross-platform compatibility

## 📊 **System Requirements**

- **Node.js**: Version 16 or higher
- **npm**: Version 8 or higher
- **RAM**: At least 4GB available
- **Disk Space**: At least 2GB free
- **Ports**: 3000, 5000, 8545 must be available

## 🎉 **Success Indicators**

When the script completes successfully, you'll see:

```
🎉 SYSTEM STARTUP COMPLETE!
===============================================

🌐 Access Points:
   Frontend:    http://localhost:3000
   Backend API: http://localhost:5000
   Blockchain:  http://localhost:8545

🔑 Test Account (for MetaMask):
   Address: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
   Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

📱 Next Steps:
   1. Open http://localhost:3000 in your browser
   2. Connect MetaMask to localhost:8545
   3. Import the test account using the private key above
   4. Start using the Blockchain Identity System!
```

## 🚀 **Ready to Go!**

The single script approach makes it incredibly easy to get the entire Blockchain Identity System running with just one command. Perfect for academic demonstrations and development work!

**Just run the script and you're ready to demonstrate decentralized identity, credential verification, and zero-knowledge proofs!** 🎯
