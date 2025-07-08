@echo off
echo ========================================
echo Lead Finder Type Error Fix
echo ========================================
echo.

echo Step 1: Stopping any running dev server
echo Press Ctrl+C in the dev server window, then press any key here to continue...
pause > nul

echo.
echo Step 2: Cleaning Next.js cache...
if exist .next (
    rmdir /s /q .next
    echo - Removed .next directory
) else (
    echo - .next directory not found
)

if exist node_modules\.cache (
    rmdir /s /q node_modules\.cache  
    echo - Removed node_modules\.cache directory
) else (
    echo - node_modules\.cache not found
)

echo.
echo Step 3: Rebuilding the project...
echo This may take a few minutes...
echo.
call npm run build

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo Build completed successfully!
    echo ========================================
    echo.
    echo The type errors in lead-finder routes have been fixed:
    echo - /api/lead-finder/search now checks types before .includes()
    echo - /api/lead-finder/details now checks types before string operations
    echo - /api/debug-utm-fields already fixed earlier
    echo.
    echo You can now start the server with:
    echo   npm start
    echo.
    echo Or for development:
    echo   npm run dev
) else (
    echo.
    echo ========================================
    echo Build failed!
    echo ========================================
    echo Please check the error messages above.
)

echo.
pause
