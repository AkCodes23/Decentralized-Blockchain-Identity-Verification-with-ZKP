@echo off
setlocal enableextensions

REM One-click Windows starter for Blockchain Identity System
REM This wrapper calls the PowerShell script with proper execution policy.

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0start-everything.ps1" %*

endlocal
@echo off
echo Starting Blockchain Identity System...
echo ===============================================

REM Check if PowerShell is available
powershell -Command "Get-Host" >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: PowerShell is not available
    pause
    exit /b 1
)

REM Run the PowerShell script
powershell -ExecutionPolicy Bypass -File "start-everything.ps1"

pause
