@echo off
echo 🐍 Fish Mate Model Converter - Python 3.10
echo ==========================================

REM Check if Python 3.10 is available
where py -3.10 >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo ❌ Python 3.10 not found
    echo 📥 Please install Python 3.10 from: https://www.python.org/downloads/release/python-31011/
    echo 💡 Install alongside your current Python (don't replace)
    pause
    exit /b 1
)

echo ✅ Python 3.10 found
echo 📦 Setting up clean environment...

REM Create virtual environment with Python 3.10
py -3.10 -m venv tfjs_env_310

echo 🔄 Activating environment...
call tfjs_env_310\Scripts\activate.bat

echo 📚 Installing compatible packages...
pip install "numpy==1.21.6" "tensorflow==2.10.0" "tensorflowjs==3.21.0" "h5py==3.7.0"

echo 🤖 Converting model...
tensorflowjs_converter --input_format=keras --output_format=tfjs_layers_model ./public/model/fish_mate_model.h5 ./public/model/

if %ERRORLEVEL% equ 0 (
    echo ✅ Model conversion successful!
    echo 📁 Files created:
    dir /b public\model\*.json public\model\*.bin 2>nul
    echo 🚀 Your TensorFlow.js component should now work!
) else (
    echo ❌ Conversion failed
)

echo 🧹 Deactivating environment...
call deactivate

echo.
echo 🎯 Next steps:
echo    1. Refresh your browser at http://localhost:5173
echo    2. Try uploading a fish image to the TensorFlow.js component
echo    3. The model should now load successfully!

pause