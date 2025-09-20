# Fix TensorFlow.js Conversion Issues
# This script creates a clean environment for model conversion

echo "🔧 Setting up clean Python environment for model conversion..."

# Create virtual environment
python -m venv tfjs_env

# Activate environment (Windows)
tfjs_env\Scripts\activate

# Install compatible versions
pip install "numpy==1.21.0" "tensorflow==2.13.0" "tensorflowjs==4.4.0"

# Convert model
tensorflowjs_converter --input_format=keras --output_format=tfjs_layers_model ./public/model/fish_mate_model.h5 ./public/model/

# Deactivate environment
deactivate

echo "✅ Model conversion complete!"