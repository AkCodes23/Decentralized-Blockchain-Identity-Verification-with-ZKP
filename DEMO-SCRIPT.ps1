# ========================================
# BLOCKCHAIN IDENTITY SYSTEM - DEMO SCRIPT
# ========================================
# This script starts all services for the professor demonstration
# Run this script to get the complete system running

Write-Host "🚀 Starting Blockchain Identity System Demo..." -ForegroundColor Green
Write-Host "===============================================" -ForegroundColor Cyan

# Set the project root directory
$projectRoot = "A:\college\3rd year\IS\Lab\Project"
Set-Location $projectRoot

# Function to check if a port is in use
function Test-Port {
    param([int]$Port)
    try {
        $connection = New-Object System.Net.Sockets.TcpClient
        $connection.Connect("localhost", $Port)
        $connection.Close()
        return $true
    }
    catch {
        return $false
    }
}

# Function to wait for a service to be ready
function Wait-ForService {
    param([int]$Port, [string]$ServiceName, [int]$TimeoutSeconds = 30)
    
    Write-Host "⏳ Waiting for $ServiceName to start on port $Port..." -ForegroundColor Yellow
    $elapsed = 0
    
    while ($elapsed -lt $TimeoutSeconds) {
        if (Test-Port -Port $Port) {
            Write-Host "✅ $ServiceName is ready!" -ForegroundColor Green
            return $true
        }
        Start-Sleep -Seconds 2
        $elapsed += 2
    }
    
    Write-Host "❌ $ServiceName failed to start within $TimeoutSeconds seconds" -ForegroundColor Red
    return $false
}

# Step 1: Clean up any existing processes
Write-Host "🧹 Cleaning up existing processes..." -ForegroundColor Yellow
try {
    Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force
    Start-Sleep -Seconds 2
} catch {
    Write-Host "No existing Node.js processes found" -ForegroundColor Gray
}

# Step 2: Start Blockchain Node
Write-Host "⛓️ Starting Hardhat Blockchain Node..." -ForegroundColor Cyan
Set-Location "$projectRoot\contracts"
$blockchainProcess = Start-Process -FilePath "cmd" -ArgumentList "/k", "cd /d `"$projectRoot\contracts`" & npx hardhat node" -PassThru -WindowStyle Normal

# Wait for blockchain node to be ready
if (Wait-ForService -Port 8545 -ServiceName "Blockchain Node" -TimeoutSeconds 30) {
    Write-Host "✅ Blockchain node is running on http://localhost:8545" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to start blockchain node" -ForegroundColor Red
    exit 1
}

# Step 3: Deploy Smart Contracts
Write-Host "📜 Deploying Smart Contracts..." -ForegroundColor Cyan
try {
    $deployResult = & npx hardhat run scripts/deploy.js --network localhost 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Smart contracts deployed successfully!" -ForegroundColor Green
        Write-Host "Contract Addresses:" -ForegroundColor Yellow
        Write-Host $deployResult -ForegroundColor White
    } else {
        Write-Host "❌ Failed to deploy contracts: $deployResult" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Error deploying contracts: $_" -ForegroundColor Red
    exit 1
}

# Step 4: Start Backend Server
Write-Host "🔧 Starting Backend API Server..." -ForegroundColor Cyan
Set-Location "$projectRoot\backend"
$backendProcess = Start-Process -FilePath "cmd" -ArgumentList "/k", "cd /d `"$projectRoot\backend`" & node simple-server.js" -PassThru -WindowStyle Normal

# Wait for backend to be ready
if (Wait-ForService -Port 5000 -ServiceName "Backend API" -TimeoutSeconds 30) {
    Write-Host "✅ Backend API is running on http://localhost:5000" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to start backend server" -ForegroundColor Red
    exit 1
}

# Step 5: Start Frontend Application
Write-Host "🌐 Starting Frontend Application..." -ForegroundColor Cyan
Set-Location "$projectRoot\frontend"
$frontendProcess = Start-Process -FilePath "cmd" -ArgumentList "/k", "cd /d `"$projectRoot\frontend`" & npm start" -PassThru -WindowStyle Normal

# Wait for frontend to be ready
if (Wait-ForService -Port 3000 -ServiceName "Frontend App" -TimeoutSeconds 60) {
    Write-Host "✅ Frontend application is running on http://localhost:3000" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to start frontend application" -ForegroundColor Red
    exit 1
}

# Step 6: Display System Status
Write-Host ""
Write-Host "🎉 SYSTEM READY FOR DEMONSTRATION!" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📱 Access Points:" -ForegroundColor Yellow
Write-Host "   Frontend:     http://localhost:3000" -ForegroundColor White
Write-Host "   Backend API:  http://localhost:5000" -ForegroundColor White
Write-Host "   Blockchain:   http://localhost:8545" -ForegroundColor White
Write-Host ""
Write-Host "🔑 MetaMask Configuration:" -ForegroundColor Yellow
Write-Host "   Network Name: Hardhat Local" -ForegroundColor White
Write-Host "   RPC URL:      http://localhost:8545" -ForegroundColor White
Write-Host "   Chain ID:     31337" -ForegroundColor White
Write-Host "   Currency:     ETH" -ForegroundColor White
Write-Host ""
Write-Host "💰 Test Account:" -ForegroundColor Yellow
Write-Host "   Address:      0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266" -ForegroundColor White
Write-Host "   Private Key:  0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80" -ForegroundColor White
Write-Host "   Balance:      10,000 ETH (test tokens)" -ForegroundColor White
Write-Host ""
Write-Host "🎯 Demo Features:" -ForegroundColor Yellow
Write-Host "   ✅ Create Decentralized Identities (DIDs)" -ForegroundColor Green
Write-Host "   ✅ Issue Digital Credentials" -ForegroundColor Green
Write-Host "   ✅ Zero-Knowledge Proof Verification" -ForegroundColor Green
Write-Host "   ✅ MetaMask Wallet Integration" -ForegroundColor Green
Write-Host "   ✅ Blockchain-based Storage" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Demo Steps:" -ForegroundColor Yellow
Write-Host "   1. Open http://localhost:3000 in browser" -ForegroundColor White
Write-Host "   2. Configure MetaMask with above settings" -ForegroundColor White
Write-Host "   3. Import test account with private key" -ForegroundColor White
Write-Host "   4. Connect wallet to the application" -ForegroundColor White
Write-Host "   5. Create your first DID" -ForegroundColor White
Write-Host "   6. Issue educational/professional credentials" -ForegroundColor White
Write-Host "   7. Demonstrate zero-knowledge verification" -ForegroundColor White
Write-Host ""
Write-Host "⚠️  To stop all services, close the command windows or press Ctrl+C" -ForegroundColor Red
Write-Host ""
Write-Host "🚀 Ready for Professor Demonstration!" -ForegroundColor Green

# Keep the script running
Write-Host "Press any key to stop all services..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

# Cleanup function
Write-Host "🛑 Stopping all services..." -ForegroundColor Red
try {
    Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force
    Write-Host "✅ All services stopped" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Some services may still be running" -ForegroundColor Yellow
}

Write-Host "Demo completed. Thank you!" -ForegroundColor Cyan
