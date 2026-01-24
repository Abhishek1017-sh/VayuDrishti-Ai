@echo off
echo ========================================
echo VayuDrishti AI - Dashboard Quick Start
echo ========================================
echo.

REM Check if we're in the right directory
if not exist backend (
    echo ERROR: backend folder not found!
    echo Please run this script from the project root directory.
    pause
    exit /b 1
)

echo [1/4] Seeding Industry and Home dashboard data...
cd backend
node seed-dashboards.js
if errorlevel 1 (
    echo ERROR: Database seeding failed!
    pause
    exit /b 1
)

echo.
echo [2/4] Starting backend server on port 9000...
start "VayuDrishti Backend" cmd /k "npm start"
timeout /t 3 /nobreak >nul

echo.
echo [3/4] Starting frontend dev server on port 5173...
cd ..\frontend
start "VayuDrishti Frontend" cmd /k "npm run dev"
timeout /t 3 /nobreak >nul

echo.
echo [4/4] Setup complete!
echo.
echo ========================================
echo    Dashboards are ready!
echo ========================================
echo.
echo Industry Dashboard:
echo   http://localhost:5173/dashboard/industry
echo.
echo Home Dashboard:
echo   http://localhost:5173/dashboard/home
echo.
echo Admin Alerts:
echo   http://localhost:5173/alerts/admin
echo.
echo API Endpoints:
echo   Industry: http://localhost:9000/api/industry/dashboard/FACILITY_001
echo   Home:     http://localhost:9000/api/home/dashboard/HOME_001
echo.
echo ========================================
echo.
echo Press any key to open Industry Dashboard in browser...
pause >nul

start http://localhost:5173/dashboard/industry

echo.
echo All servers are running in separate windows.
echo Close those windows to stop the servers.
echo.
pause
