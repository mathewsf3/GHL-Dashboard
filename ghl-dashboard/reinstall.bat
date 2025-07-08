@echo off
echo Cleaning up old installation...
rmdir /s /q node_modules
del package-lock.json

echo Installing dependencies...
npm install

echo Installation complete!
pause