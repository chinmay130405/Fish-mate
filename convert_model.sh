#!/bin/bash
# Model Conversion Script
# This converts your Keras .h5 model to TensorFlow.js format

echo "🔄 Converting fish_mate_model.h5 to TensorFlow.js format..."

# Step 1: Install tensorflowjs converter (if not installed)
echo "📦 Installing TensorFlow.js converter..."
pip install tensorflowjs

# Step 2: Convert the model
echo "🤖 Converting model..."
tensorflowjs_converter \
    --input_format=keras \
    --output_format=tfjs_layers_model \
    ./public/model/fish_mate_model.h5 \
    ./public/model/

echo "✅ Conversion complete!"
echo "📁 Files created:"
echo "   - model.json (architecture)"
echo "   - model_weights.bin (weights)"
echo ""
echo "🚀 Your TensorFlow.js component should now work!"