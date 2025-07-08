@echo off
echo ========================================
echo GHL Dashboard - Lead Finder NULL Fix
echo ========================================
echo.
echo This fixes the "Cannot read properties of null (reading 'firstName')" error
echo in the Lead Finder page once and for all.
echo.

echo Step 1: Stopping any running servers
echo Please close all terminal windows running npm start or npm run dev
echo Press any key when ready to continue...
pause > nul

echo.
echo Step 2: Cleaning ALL cache directories...
echo.

REM Clean .next directory
if exist .next (
    echo Removing .next directory...
    rmdir /s /q .next
    if %ERRORLEVEL% EQU 0 (
        echo ✓ Removed .next directory
    ) else (
        echo ⚠ Failed to remove .next - try closing any programs using it
    )
) else (
    echo - .next directory not found (already clean)
)

REM Clean node_modules cache
if exist node_modules\.cache (
    echo Removing node_modules\.cache directory...
    rmdir /s /q node_modules\.cache  
    if %ERRORLEVEL% EQU 0 (
        echo ✓ Removed node_modules\.cache directory
    ) else (
        echo ⚠ Failed to remove node_modules\.cache
    )
) else (
    echo - node_modules\.cache not found (already clean)
)

REM Clean any browser cache hint
echo.
echo TIP: Also clear your browser cache (Ctrl+Shift+Delete) for best results!
echo.

echo Step 3: Installing dependencies (ensuring everything is up to date)...
echo.
call npm install --force

echo.
echo Step 4: Building the project with all fixes...
echo This will take 2-3 minutes. Please be patient...
echo.
call npm run build

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo ✅ BUILD SUCCESSFUL!
    echo ========================================
    echo.
    echo FIXES APPLIED:
    echo ✅ Lead Finder page - Added null checks for firstName/lastName
    echo ✅ Field type safety - Created safe contact utility functions
    echo ✅ Debug sections - Fixed all selectedContact references
    echo.
    echo NEW UTILITIES AVAILABLE:
    echo - getContactFullName(contact) - Returns safe full name
    echo - getContactFirstName(contact) - Returns firstName or 'Unknown'
    echo - getContactLastName(contact) - Returns lastName or empty string
    echo - createSafeContact(contact) - Creates contact with all safe values
    echo.
    echo ========================================
    echo NEXT STEPS
    echo ========================================
    echo.
    echo 1. Start the server:
    echo    npm start
    echo.
    echo 2. Test the Lead Finder:
    echo    - Go to http://localhost:3000/lead-finder
    echo    - Search for any contact
    echo    - Click to view details
    echo    - Verify no errors occur
    echo.
    echo 3. If you STILL see errors:
    echo    - Clear browser cache completely
    echo    - Try incognito/private mode
    echo    - Check browser console for exact error location
    echo.
    echo The Lead Finder should now work without any firstName errors!
    echo.
) else (
    echo.
    echo ========================================
    echo ❌ BUILD FAILED
    echo ========================================
    echo.
    echo The build process encountered errors.
    echo.
    echo TROUBLESHOOTING:
    echo 1. Make sure all files are saved
    echo 2. Check for syntax errors in the code
    echo 3. Try running: npm run dev
    echo    to see more detailed error messages
    echo 4. If TypeScript errors, try: npm run type-check
    echo.
    echo If the issue persists, the error details are above.
    echo.
)

echo Press any key to exit...
pause > nul
