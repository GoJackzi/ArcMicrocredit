@echo off
REM Script to copy contract ABI from backend to frontend (Windows)

set BACKEND_DIR=G:\Arc-Microcredit-Protocol\backend
set FRONTEND_DIR=G:\Arc-Microcredit-Protocol\frontend
set ABI_SOURCE=%BACKEND_DIR%\out\ReputationCredit.sol\ReputationCredit.json
set ABI_DEST=%FRONTEND_DIR%\lib\contract-abi.json

echo Copying contract ABI from backend to frontend...

if not exist "%ABI_SOURCE%" (
    echo Error: Contract ABI not found at %ABI_SOURCE%
    echo Please run 'forge build' in the backend directory first.
    exit /b 1
)

REM Create lib directory if it doesn't exist
if not exist "%FRONTEND_DIR%\lib" mkdir "%FRONTEND_DIR%\lib"

REM Copy the file (you'll need to extract just the ABI manually or use Node.js)
echo ABI source: %ABI_SOURCE%
echo ABI destination: %ABI_DEST%
echo.
echo Note: You may need to extract just the "abi" field from the JSON file manually,
echo or use Node.js to parse and copy just the ABI array.

pause

