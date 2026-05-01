@echo off
setlocal

cd /d "%~dp0"

if /I "%~1"=="--test" goto :test

if not exist node_modules (
  echo Installing dependencies...
  call npm install
  if errorlevel 1 goto :fail
)

echo Starting Astro dev server...
start "chip-tutorial dev" cmd /k "cd /d %~dp0 && npm run dev"

timeout /t 4 /nobreak >nul
start "" http://localhost:4321
exit /b 0

:test
echo Launcher: %~nx0
echo Working directory: %~dp0
echo.
echo This file will:
echo   1. Install dependencies if node_modules is missing
echo   2. Start npm run dev in a new console window
echo   3. Open http://localhost:4321 in your browser
exit /b 0

:fail
echo.
echo Startup failed.
pause
exit /b 1