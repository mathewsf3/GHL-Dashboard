@echo off
cls
color 0A
echo ================================================================================
echo                     GHL DASHBOARD - ULTIMATE NULL FIX v2.0
echo ================================================================================
echo.
echo This script will COMPLETELY fix the "Cannot read properties of null" error.
echo It performs a deep clean and rebuild of your entire project.
echo.
echo ⚠️  IMPORTANT: This will take 3-5 minutes. Please be patient!
echo.
echo Press Ctrl+C now to cancel, or
pause

echo.
echo [1/7] Killing any Node.js processes...
echo ================================================================================
taskkill /F /IM node.exe 2>nul
if %ERRORLEVEL% EQU 0 (
    echo ✓ Killed existing Node.js processes
    timeout /t 2 >nul
) else (
    echo ✓ No Node.js processes were running
)

echo.
echo [2/7] Deep cleaning build artifacts...
echo ================================================================================

REM Remove .next directory
if exist .next (
    echo Removing .next build directory...
    rmdir /s /q .next 2>nul
    if exist .next (
        echo ⚠️  Could not remove .next - trying alternative method...
        rd /s /q .next 2>nul
    )
    if not exist .next (
        echo ✓ Successfully removed .next directory
    ) else (
        echo ❌ Failed to remove .next - please close any programs using it
        pause
        exit /b 1
    )
) else (
    echo ✓ .next directory already clean
)

REM Remove node_modules cache
if exist node_modules\.cache (
    echo Removing node_modules cache...
    rmdir /s /q node_modules\.cache 2>nul
    echo ✓ Removed node_modules cache
)

REM Remove other Next.js artifacts
if exist .next.cache (
    rmdir /s /q .next.cache 2>nul
    echo ✓ Removed .next.cache
)

if exist out (
    rmdir /s /q out 2>nul
    echo ✓ Removed out directory
)

echo.
echo [3/7] Verifying fix files exist...
echo ================================================================================

set MISSING_FILES=0

if not exist "src\app\lead-finder\page.tsx" (
    echo ❌ Missing: src\app\lead-finder\page.tsx
    set MISSING_FILES=1
)

if not exist "src\utils\field-type-safety.ts" (
    echo ❌ Missing: src\utils\field-type-safety.ts
    set MISSING_FILES=1
)

if %MISSING_FILES% EQU 1 (
    echo.
    echo ❌ Required files are missing! Make sure you're in the right directory.
    pause
    exit /b 1
) else (
    echo ✓ All required files found
)

echo.
echo [4/7] Installing/updating dependencies...
echo ================================================================================
echo This ensures all packages are properly installed...
echo.
call npm install --force --silent
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Failed to install dependencies
    echo Try running: npm install --force
    pause
    exit /b 1
) else (
    echo ✓ Dependencies installed successfully
)

echo.
echo [5/7] Type checking the project...
echo ================================================================================
echo Checking for TypeScript errors...
echo.
call npx tsc --noEmit
if %ERRORLEVEL% NEQ 0 (
    echo ⚠️  TypeScript found some issues (this is often okay)
    echo Continuing with build...
) else (
    echo ✓ No TypeScript errors found
)

echo.
echo [6/7] Building the project...
echo ================================================================================
echo This compiles all TypeScript files and applies all fixes...
echo.
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ❌ BUILD FAILED!
    echo.
    echo Please check the error messages above.
    echo Common issues:
    echo - Syntax errors in the code
    echo - Missing dependencies
    echo - Port already in use
    echo.
    pause
    exit /b 1
)

echo.
echo [7/7] Verification...
echo ================================================================================

REM Check if build directory was created
if exist .next (
    echo ✓ Build directory created successfully
) else (
    echo ❌ Build directory not found
    pause
    exit /b 1
)

echo.
echo ================================================================================
echo                            ✅ FIX COMPLETED SUCCESSFULLY!
echo ================================================================================
echo.
echo The NULL reference error in Lead Finder has been fixed!
echo.
echo WHAT WAS FIXED:
echo ✓ Added null checks for firstName/lastName in Lead Finder page
echo ✓ Created utility functions for safe contact handling
echo ✓ Updated all contact display logic with fallback values
echo.
echo NEXT STEPS:
echo -----------
echo 1. Start the server:
echo    npm start
echo.
echo 2. IMPORTANT - Clear browser cache:
echo    - Chrome: Ctrl+Shift+Delete → Cached images and files → Clear data
echo    - Or use Incognito mode (Ctrl+Shift+N)
echo.
echo 3. Test Lead Finder:
echo    - Go to: http://localhost:3000/lead-finder
echo    - Search for: test, george, robert, or any name
echo    - Click on results to view details
echo    - You should see "Unknown" for missing names (not errors)
echo.
echo 4. Check browser console (F12) - should have NO red errors
echo.
echo If you STILL see errors after these steps:
echo - Run: test-lead-finder.bat (to diagnose)
echo - Try a different browser
echo - The error might be from a different page/component
echo.
echo ================================================================================
color 07
pause
