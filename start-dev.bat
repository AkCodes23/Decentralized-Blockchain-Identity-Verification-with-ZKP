@echo off
echo Starting Blockchain Identity System in Development Mode...

echo.
echo Step 1: Starting local blockchain...
start "Blockchain Node" cmd /k "cd contracts && npx hardhat node"

echo Waiting for blockchain to start...
timeout /t 5 /nobreak > nul

echo.
echo Step 2: Deploying contracts...
cd contracts
call npx hardhat run scripts/deploy.js --network localhost
cd ..

echo.
echo Step 3: Starting backend server...
start "Backend Server" cmd /k "cd backend && npm run dev"

echo Waiting for backend to start...
timeout /t 3 /nobreak > nul

echo.
echo Step 4: Starting frontend...
start "Frontend App" cmd /k "cd frontend && npm start"

echo.
echo All services started!
echo.
echo Frontend: http://localhost:3000
echo Backend: http://localhost:5000
echo Blockchain: http://localhost:8545
echo.
echo Press any key to stop all services...
pause

echo Stopping services...
taskkill /f /im node.exe 2>nul
echo Services stopped.
