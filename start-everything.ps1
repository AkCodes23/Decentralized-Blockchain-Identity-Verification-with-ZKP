param(
    [switch]$Demo
)

# Blockchain Identity System - Complete Startup Script
# Purpose: Start blockchain node, deploy contracts, start backend and frontend.
# Usage: Right-click and "Run with PowerShell" or run: .\start-everything.ps1 [-Demo]
# -Demo: Uses the mock backend `backend/working-server.js` for a fast, deterministic demo.

Write-Host "Starting Blockchain Identity System..." -ForegroundColor Green
Write-Host "===============================================" -ForegroundColor Green
$ProjectRoot = if ($PSScriptRoot) { $PSScriptRoot } else { (Get-Location).Path }
Set-Location $ProjectRoot

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
    
    Write-Host "Waiting for $ServiceName to start on port $Port..." -ForegroundColor Yellow
    $timeout = (Get-Date).AddSeconds($TimeoutSeconds)
    
    while ((Get-Date) -lt $timeout) {
        if (Test-Port -Port $Port) {
            Write-Host "$ServiceName is ready!" -ForegroundColor Green
            return $true
        }
        Start-Sleep -Seconds 2
    }
    
    Write-Host "$ServiceName failed to start within $TimeoutSeconds seconds" -ForegroundColor Red
    return $false
}

# Function to kill existing processes
function Stop-ExistingServices {
    Write-Host "Stopping existing services..." -ForegroundColor Yellow
    
    # Kill existing Node.js processes
    Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
    
    # Kill processes using our ports
    $ports = @(3000, 5000, 8545)
    foreach ($port in $ports) {
        $processes = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess
        foreach ($processId in $processes) {
            try {
                Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
            }
            catch {
                # Ignore errors if process doesn't exist
            }
        }
    }
    
    Start-Sleep -Seconds 2
}

# Function to check dependencies
function Test-Dependencies {
    Write-Host "Checking dependencies..." -ForegroundColor Yellow
    
    # Check if Node.js is installed
    try {
        $nodeVersion = node --version
        Write-Host "Node.js version: $nodeVersion" -ForegroundColor Green
    }
    catch {
        Write-Host "Node.js is not installed. Please install Node.js first." -ForegroundColor Red
        exit 1
    }
    
    # Check if npm is available
    try {
        $npmVersion = npm --version
        Write-Host "npm version: $npmVersion" -ForegroundColor Green
    }
    catch {
        Write-Host "npm is not available. Please install npm first." -ForegroundColor Red
        exit 1
    }
    
    # Check if we're in the right directory (must have project root package.json)
    if (-not (Test-Path "package.json")) {
        Write-Host "Please run this script from the project root directory." -ForegroundColor Red
        exit 1
    }
    
    Write-Host "All dependencies are available" -ForegroundColor Green
}

# Function to install dependencies if needed
function Install-Dependencies {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    
    # Install root dependencies
    if (-not (Test-Path "node_modules")) {
        Write-Host "Installing root dependencies..." -ForegroundColor Cyan
        npm install
    }
    
    # Install contract dependencies
    if (-not (Test-Path "contracts/node_modules")) {
        Write-Host "Installing contract dependencies..." -ForegroundColor Cyan
        Set-Location "contracts"
        npm install
        Set-Location ".."
    }
    
    # Install backend dependencies
    if (-not (Test-Path "backend/node_modules")) {
        Write-Host "Installing backend dependencies..." -ForegroundColor Cyan
        Set-Location "backend"
        npm install
        Set-Location ".."
    }
    
    # Install frontend dependencies
    if (-not (Test-Path "frontend/node_modules")) {
        Write-Host "Installing frontend dependencies..." -ForegroundColor Cyan
        Set-Location "frontend"
        npm install
        Set-Location ".."
    }
    
    Write-Host "All dependencies installed" -ForegroundColor Green
}

# Function to set environment variables expected by services
function Set-Environment {
    Write-Host "Setting environment variables..." -ForegroundColor Yellow
    # Backend expects ETHEREUM_RPC_URL and FRONTEND_URL
    $env:ETHEREUM_RPC_URL = "http://localhost:8545"
    $env:FRONTEND_URL = "http://localhost:3000"
    if (-not $env:ENCRYPTION_KEY) { $env:ENCRYPTION_KEY = "demo-encryption-key" }
    Write-Host "   ETHEREUM_RPC_URL=$($env:ETHEREUM_RPC_URL)" -ForegroundColor DarkGray
    Write-Host "   FRONTEND_URL=$($env:FRONTEND_URL)" -ForegroundColor DarkGray
    Write-Host "   ENCRYPTION_KEY set" -ForegroundColor DarkGray
    Write-Host "Environment configured" -ForegroundColor Green
}

# Function to start blockchain node
function Start-BlockchainNode {
    Write-Host "Starting blockchain node..." -ForegroundColor Yellow
    
    # Start Hardhat node in background
    $blockchainJob = Start-Job -ArgumentList $ProjectRoot -ScriptBlock {
        param($root)
        Set-Location (Join-Path $root 'contracts')
        npx hardhat node
    }
    
    # Wait for blockchain to be ready
    if (Wait-ForService -Port 8545 -ServiceName "Blockchain Node" -TimeoutSeconds 30) {
        Write-Host "Blockchain node started successfully" -ForegroundColor Green
        return $blockchainJob
    } else {
        Write-Host "Failed to start blockchain node" -ForegroundColor Red
        Stop-Job $blockchainJob
        Remove-Job $blockchainJob
        exit 1
    }
}

# Function to deploy contracts
function Deploy-Contracts {
    Write-Host "Deploying smart contracts..." -ForegroundColor Yellow
    
    Set-Location "contracts"
    
    try {
        # Compile contracts
        Write-Host "Compiling contracts..." -ForegroundColor Cyan
        npx hardhat compile
        
        # Deploy contracts
        Write-Host "Deploying contracts..." -ForegroundColor Cyan
        npx hardhat run scripts/deploy.js --network localhost
        
        Write-Host "Contracts deployed successfully" -ForegroundColor Green
    }
    catch {
        Write-Host ("Failed to deploy contracts: {0}" -f $_.Exception.Message) -ForegroundColor Red
        Set-Location ".."
        exit 1
    }
    
    Set-Location ".."
}

# Function to start backend server
function Start-BackendServer {
    Write-Host "Starting backend server..." -ForegroundColor Yellow
    
    # Decide which backend to run based on -Demo flag
    if ($Demo) {
        Write-Host "   Demo mode: starting mock backend (working-server.js)" -ForegroundColor Cyan
        $backendJob = Start-Job -ArgumentList $ProjectRoot -ScriptBlock {
            param($root)
            Set-Location (Join-Path $root 'backend')
            node .\working-server.js
        }
    } else {
        Write-Host "   Full mode: starting API backend (server.js)" -ForegroundColor Cyan
        $backendJob = Start-Job -ArgumentList $ProjectRoot -ScriptBlock {
            param($root)
            Set-Location (Join-Path $root 'backend')
            npm run dev
        }
    }
    
    # Wait for backend to be ready
    if (Wait-ForService -Port 5000 -ServiceName "Backend Server" -TimeoutSeconds 30) {
        Write-Host "Backend server started successfully" -ForegroundColor Green
        return $backendJob
    } else {
        Write-Host "Failed to start backend server" -ForegroundColor Red
        Stop-Job $backendJob
        Remove-Job $backendJob
        exit 1
    }
}

# Function to start frontend application
function Start-FrontendApp {
    Write-Host "Starting frontend application..." -ForegroundColor Yellow
    
    # Start frontend in background
    $frontendJob = Start-Job -ArgumentList $ProjectRoot -ScriptBlock {
        param($root)
        Set-Location (Join-Path $root 'frontend')
        npm start
    }
    
    # Wait for frontend to be ready
    if (Wait-ForService -Port 3000 -ServiceName "Frontend App" -TimeoutSeconds 60) {
        Write-Host "Frontend application started successfully" -ForegroundColor Green
        return $frontendJob
    } else {
        Write-Host "Failed to start frontend application" -ForegroundColor Red
        Stop-Job $frontendJob
        Remove-Job $frontendJob
        exit 1
    }
}

# Function to display system status
function Show-SystemStatus {
    Write-Host ""
    Write-Host "SYSTEM STARTUP COMPLETE!" -ForegroundColor Green
    Write-Host "===============================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Access Points:" -ForegroundColor Cyan
    Write-Host "   Frontend:    http://localhost:3000" -ForegroundColor White
    Write-Host "   Backend API: http://localhost:5000" -ForegroundColor White
    Write-Host "   Blockchain:  http://localhost:8545" -ForegroundColor White
    Write-Host ""
    if ($Demo) {
        Write-Host "Mode: Demo (mock backend with seeded data)" -ForegroundColor Yellow
    } else {
        Write-Host "Mode: Full (API backend + contracts)" -ForegroundColor Yellow
    }
    Write-Host ""
    Write-Host "Test Account (for MetaMask):" -ForegroundColor Cyan
    Write-Host "   Address: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266" -ForegroundColor White
    Write-Host "   Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80" -ForegroundColor White
    Write-Host ""
    Write-Host "Next Steps:" -ForegroundColor Cyan
    Write-Host "   1. Open http://localhost:3000 in your browser" -ForegroundColor White
    Write-Host "   2. Connect MetaMask to localhost:8545" -ForegroundColor White
    Write-Host "   3. Import the test account using the private key above" -ForegroundColor White
    Write-Host "   4. Start using the Blockchain Identity System!" -ForegroundColor White
    Write-Host ""
    Write-Host "To stop all services, press Ctrl+C" -ForegroundColor Yellow
    Write-Host ""
}

# Function to handle cleanup on exit
function Stop-AllServices {
    Write-Host ""
    Write-Host "Stopping all services..." -ForegroundColor Yellow
    
    # Stop all background jobs
    Get-Job | Stop-Job
    Get-Job | Remove-Job
    
    # Kill any remaining processes
    Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
    
    Write-Host "All services stopped" -ForegroundColor Green
}

# Main execution
try {
    # Set up cleanup handler
    Register-EngineEvent -SourceIdentifier PowerShell.Exiting -Action { Stop-AllServices }
    
    # Step 1: Check dependencies
    Test-Dependencies
    
    # Step 2: Stop existing services
    Stop-ExistingServices
    
    # Step 3: Install dependencies
    Install-Dependencies
    
    # Step 4: Set environment
    Set-Environment
    
    # Step 5: Start blockchain node
    $blockchainJob = Start-BlockchainNode
    
    # Step 6: Deploy contracts (skipped in Demo mode as mock backend doesn't require them)
    if ($Demo) {
    Write-Host "Skipping contract deployment in Demo mode" -ForegroundColor Yellow
    } else {
        Deploy-Contracts
    }
    
    # Step 7: Start backend server
    $backendJob = Start-BackendServer
    
    # Step 8: Start frontend application
    $frontendJob = Start-FrontendApp
    
    # Step 9: Show system status
    Show-SystemStatus
    
    # Keep script running and monitor services
    Write-Host "Monitoring services... (Press Ctrl+C to stop)" -ForegroundColor Yellow
    
    while ($true) {
        Start-Sleep -Seconds 10
        
        # Check if services are still running
        $blockchainRunning = Test-Port -Port 8545
        $backendRunning = Test-Port -Port 5000
        $frontendRunning = Test-Port -Port 3000
        
        if (-not $blockchainRunning) {
            Write-Host "Blockchain node stopped unexpectedly" -ForegroundColor Red
        }
        if (-not $backendRunning) {
            Write-Host "Backend server stopped unexpectedly" -ForegroundColor Red
        }
        if (-not $frontendRunning) {
            Write-Host "Frontend app stopped unexpectedly" -ForegroundColor Red
        }
    }
}
catch {
    Write-Host ("ERROR: {0}" -f $_.Exception.Message) -ForegroundColor Red
    Stop-AllServices
    exit 1
}
finally {
    Stop-AllServices
}
