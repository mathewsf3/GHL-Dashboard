@echo off
echo Cleaning Next.js cache and rebuilding...
echo.

echo Step 1: Stopping any running dev server (press Ctrl+C if needed)
echo.
pause

echo Step 2: Cleaning cache directories...
if exist .next (
    rmdir /s /q .next
    echo - Removed .next directory
)
if exist node_modules\.cache (
    rmdir /s /q node_modules\.cache
    echo - Removed node_modules\.cache directory
)

echo.
echo Step 3: Rebuilding the project...
call npm run build

echo.
echo Build complete! You can now start the dev server with: npm run dev
echo.
pause
