@echo off
echo ========================================
echo BLOCKCHAIN IDENTITY SYSTEM - DEMO
echo ========================================
echo.
echo Starting the complete system for professor demonstration...
echo.

REM Change to project directory
cd /d "A:\college\3rd year\IS\Lab\Project"

REM Run the PowerShell demo script
powershell -ExecutionPolicy Bypass -File "DEMO-SCRIPT.ps1"

echo.
echo Demo script completed.
pause


