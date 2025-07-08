@echo off
echo Testing Lead Finder Search API...
echo.

REM Test with a common name
echo Test 1: Searching for "george"
curl -s "http://localhost:3000/api/lead-finder/search?q=george" | findstr /C:"error" /C:"contacts"

echo.
echo Test 2: Searching for "robert"  
curl -s "http://localhost:3000/api/lead-finder/search?q=robert" | findstr /C:"error" /C:"contacts"

echo.
echo Test 3: Searching for "john"
curl -s "http://localhost:3000/api/lead-finder/search?q=john" | findstr /C:"error" /C:"contacts"

echo.
echo If you see "contacts" in the output, the API is working.
echo If you see "error", there may still be an issue.
echo.
pause
