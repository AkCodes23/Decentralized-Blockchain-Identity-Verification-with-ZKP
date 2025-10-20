@echo off
echo Starting Blockchain Identity System Setup...

echo.
echo Step 1: Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo Error: npm install failed. Please install Node.js first.
    pause
    exit /b 1
)

echo.
echo Step 2: Installing contract dependencies...
cd contracts
call npm install
cd ..

echo.
echo Step 3: Installing backend dependencies...
cd backend
call npm install
cd ..

echo.
echo Step 4: Installing frontend dependencies...
cd frontend
call npm install
cd ..

echo.
echo Step 5: Setting up environment...
if not exist "backend\.env" (
    copy "backend\.env.example" "backend\.env"
    echo Environment file created. You can edit it if needed.
)

echo.
echo Setup completed successfully!
echo.
echo Next steps:
echo 1. Start local blockchain: npm run contracts:node
echo 2. Deploy contracts: npm run contracts:deploy
echo 3. Start backend: npm run backend:dev
echo 4. Start frontend: npm run frontend:dev
echo.
pause
