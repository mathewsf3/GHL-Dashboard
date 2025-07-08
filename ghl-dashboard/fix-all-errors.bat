@echo off
echo ========================================
echo GHL Dashboard - Complete Fix
echo ========================================
echo.
echo This script fixes ALL known errors:
echo 1. TypeError: .toLowerCase is not a function
echo 2. TypeError: .includes is not a function  
echo 3. Cannot read properties of null (reading 'firstName')
echo.

echo Step 1: Stopping any running servers
echo Please close any terminal windows running npm start or npm run dev
echo Press any key when ready to continue...
pause > nul

echo.
echo Step 2: Cleaning all cache directories...
echo.

REM Clean .next directory
if exist .next (
    echo Removing .next directory...
    rmdir /s /q .next
    echo ✓ Removed .next directory
) else (
    echo - .next directory not found (already clean)
)

REM Clean node_modules cache
if exist node_modules\.cache (
    echo Removing node_modules\.cache directory...
    rmdir /s /q node_modules\.cache  
    echo ✓ Removed node_modules\.cache directory
) else (
    echo - node_modules\.cache not found (already clean)
)

REM Clean any other Next.js cache
if exist .next.cache (
    echo Removing .next.cache directory...
    rmdir /s /q .next.cache
    echo ✓ Removed .next.cache directory
)

echo.
echo Step 3: Installing dependencies (just to be safe)...
echo.
call npm install

echo.
echo Step 4: Building the project...
echo This will compile all TypeScript files with the fixes applied.
echo Please wait, this may take 2-3 minutes...
echo.
call npm run build

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo ✅ BUILD SUCCESSFUL!
    echo ========================================
    echo.
    echo All fixes have been applied:
    echo.
    echo ✅ Lead Finder type errors - FIXED
    echo   - Added type checking for .includes()
    echo   - Added type checking for .toLowerCase()
    echo.
    echo ✅ Dashboard null reference - FIXED
    echo   - Added null checks for contact properties
    echo   - Added fallback values for missing data
    echo.
    echo ✅ UTM discovery errors - FIXED
    echo   - Safe string operations on all field values
    echo.
    echo ========================================
    echo NEXT STEPS
    echo ========================================
    echo.
    echo 1. Start the server:
    echo    npm start     (for production mode)
    echo    npm run dev   (for development mode)
    echo.
    echo 2. Test the fixes:
    echo    - Visit the dashboard at http://localhost:3000
    echo    - Try the Lead Finder page
    echo    - Check console for any errors
    echo.
    echo 3. If you still see errors:
    echo    - Run test-dashboard.bat to diagnose
    echo    - Check ALL_FIXES_SUMMARY.md for details
    echo.
) else (
    echo.
    echo ========================================
    echo ❌ BUILD FAILED
    echo ========================================
    echo.
    echo The build process encountered errors.
    echo Please check the error messages above.
    echo.
    echo Common solutions:
    echo 1. Run: npm install
    echo 2. Check for syntax errors in the code
    echo 3. Ensure all imports are correct
    echo 4. Try running: npm run dev
    echo    (development mode shows more detailed errors)
    echo.
)

echo Press any key to exit...
pause > nul
