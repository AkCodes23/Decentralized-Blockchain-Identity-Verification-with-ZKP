@echo off
title Blockchain Identity System - Professor Demo
color 0A

echo.
echo ========================================
echo   BLOCKCHAIN IDENTITY SYSTEM DEMO
echo   For Professor Demonstration
echo ========================================
echo.

REM Set project directory
set PROJECT_DIR=A:\college\3rd year\IS\Lab\Project
cd /d "%PROJECT_DIR%"

echo [1/5] Cleaning up existing processes...
taskkill /f /im node.exe >nul 2>&1
timeout /t 2 >nul

echo [2/5] Starting Blockchain Node...
start "Blockchain Node" cmd /k "cd /d "%PROJECT_DIR%\contracts" && npx hardhat node"
echo Waiting for blockchain to start...
timeout /t 10 >nul

echo [3/5] Deploying Smart Contracts...
cd /d "%PROJECT_DIR%\contracts"
call npx hardhat run scripts/deploy.js --network localhost
if %errorlevel% neq 0 (
    echo ERROR: Failed to deploy contracts
    pause
    exit /b 1
)

echo [4/5] Starting Backend Server...
cd /d "%PROJECT_DIR%\backend"
start "Backend Server" cmd /k "cd /d "%PROJECT_DIR%\backend" && node simple-server.js"
echo Waiting for backend to start...
timeout /t 5 >nul

echo [5/5] Starting Frontend Application...
cd /d "%PROJECT_DIR%\frontend"
start "Frontend App" cmd /k "cd /d "%PROJECT_DIR%\frontend" && npm start"
echo Waiting for frontend to start...
timeout /t 15 >nul

echo.
echo ========================================
echo   SYSTEM READY FOR DEMONSTRATION!
echo ========================================
echo.
echo Access Points:
echo   Frontend:     http://localhost:3000
echo   Backend API:  http://localhost:5000
echo   Blockchain:   http://localhost:8545
echo.
echo MetaMask Configuration:
echo   Network Name: Hardhat Local
echo   RPC URL:      http://localhost:8545
echo   Chain ID:     31337
echo   Currency:     ETH
echo.
echo Test Account:
echo   Address:      0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
echo   Private Key:  0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
echo   Balance:      10,000 ETH (test tokens)
echo.
echo Demo Features:
echo   - Create Decentralized Identities (DIDs)
echo   - Issue Digital Credentials
echo   - Zero-Knowledge Proof Verification
echo   - MetaMask Wallet Integration
echo.
echo ========================================
echo   Ready for Professor Demonstration!
echo ========================================
echo.
echo Press any key to stop all services...
pause >nul

echo Stopping all services...
taskkill /f /im node.exe >nul 2>&1
echo Demo completed. Thank you!
pause


