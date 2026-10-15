@echo off
cd /d "%~dp0"
echo Installing project dependencies...
call npm install
if errorlevel 1 pause & exit /b 1
echo Starting SmartGrievance AI...
call npm run dev
pause
