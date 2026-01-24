@echo off
REM Quick Test Script for Windows - VayuDrishti Water Tank Monitoring
REM Run this script to quickly test the complete system

echo.
echo ========================================
echo VayuDrishti Water Tank Monitoring
echo Quick Test Script
echo ========================================
echo.

echo [1/4] Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js not found! Please install Node.js first.
    pause
    exit /b 1
)
echo     Node.js: OK
echo.

echo [2/4] Seeding water tanks database...
cd backend
call node seed-water-tanks.js
if %errorlevel% neq 0 (
    echo ERROR: Database seeding failed!
    echo Make sure MongoDB is running.
    pause
    exit /b 1
)
echo.

echo [3/4] Starting backend server...
echo.
echo ========================================
echo Backend server starting on port 9000
echo Press Ctrl+C to stop when done testing
echo ========================================
echo.
echo After backend starts:
echo   1. Open NEW terminal
echo   2. Run: cd frontend
echo   3. Run: npm run dev
echo   4. Open browser: http://localhost:5173
echo   5. Go to Alerts page to see water tanks
echo.
echo To test water level updates:
echo   1. Open ANOTHER terminal
echo   2. Run: cd backend
echo   3. Run: bash test-water-tank.sh
echo      (or use Git Bash on Windows)
echo.
call npm start

cd ..
