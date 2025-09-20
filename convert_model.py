#!/usr/bin/env python3
"""
Convert Keras .h5 model to TensorFlow.js format
This script converts your fish_mate_model.h5 to work with the client-side AI component
"""

import os
import sys

def convert_model():
    print("🐟 Fish Mate Model Converter")
    print("=" * 40)
    
    # Check if tensorflowjs is installed
    try:
        import tensorflowjs as tfjs
        print("✅ TensorFlow.js converter found")
    except ImportError:
        print("❌ TensorFlow.js converter not found")
        print("📦 Installing tensorflowjs...")
        os.system("pip install tensorflowjs")
        try:
            import tensorflowjs as tfjs
            print("✅ TensorFlow.js converter installed")
        except ImportError:
            print("❌ Failed to install tensorflowjs")
            return False
    
    # Check if model file exists
    model_path = "./public/model/fish_mate_model.h5"
    if not os.path.exists(model_path):
        print(f"❌ Model file not found: {model_path}")
        return False
    
    print(f"📁 Found model: {model_path}")
    
    try:
        # Load the Keras model
        print("🤖 Loading Keras model...")
        import tensorflow as tf
        model = tf.keras.models.load_model(model_path)
        
        # Print model info
        print(f"📊 Model loaded successfully!")
        print(f"   Input shape: {model.input_shape}")
        print(f"   Output shape: {model.output_shape}")
        print(f"   Total parameters: {model.count_params():,}")
        
        # Convert to TensorFlow.js format
        print("🔄 Converting to TensorFlow.js format...")
        output_path = "./public/model/"
        
        # Save in TensorFlow.js format
        tfjs.converters.save_keras_model(model, output_path)
        
        print("✅ Conversion successful!")
        print(f"📁 Files created in {output_path}:")
        print("   - model.json (architecture)")
        print("   - group1-shard1of1.bin (weights)")
        
        # Check if files were created
        if os.path.exists(os.path.join(output_path, "model.json")):
            print("✅ model.json created")
        else:
            print("❌ model.json not found")
            
        print("\n🚀 Your client-side AI component should now work!")
        print("💡 Refresh your browser to see the model load")
        
        return True
        
    except Exception as e:
        print(f"❌ Conversion failed: {e}")
        print("\n🔧 Troubleshooting:")
        print("   1. Ensure your .h5 model is valid")
        print("   2. Check if you have TensorFlow installed")
        print("   3. Try: pip install tensorflow tensorflowjs")
        return False

if __name__ == "__main__":
    success = convert_model()
    if not success:
        sys.exit(1)