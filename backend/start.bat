@echo off
setlocal enableextensions
echo Launching root startup script...
pushd %~dp0\..
powershell -NoProfile -ExecutionPolicy Bypass -File .\start-everything.ps1 %*
popd
endlocal
