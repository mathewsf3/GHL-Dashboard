@echo off
echo ========================================
echo Dashboard Null Reference Fix
echo ========================================
echo.
echo This fixes: "Cannot read properties of null (reading 'firstName')"
echo.

echo Step 1: Stopping any running server
echo Press Ctrl+C in the server window, then press any key here to continue...
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
    echo ✅ Fixed issues:
    echo - Added null checks for contact.firstName and contact.lastName
    echo - Added fallback values ('Unknown', 'No email', etc.)
    echo - Fixed syntax error in console.log statements
    echo.
    echo The dashboard should now load without errors.
    echo.
    echo You can start the server with:
    echo   npm start (production)
    echo   npm run dev (development)
) else (
    echo.
    echo ========================================
    echo Build failed!
    echo ========================================
    echo Please check the error messages above.
    echo.
    echo Common solutions:
    echo 1. Make sure all dependencies are installed: npm install
    echo 2. Check for TypeScript errors
    echo 3. Ensure all imports are correct
)

echo.
pause
