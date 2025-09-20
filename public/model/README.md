# TensorFlow.js Fish Prediction Model

## Setup Instructions

To use the TensorFlow.js fish predictor, you need to place your trained model files in this directory:

### Required Files:
1. **`model.json`** - Model architecture and metadata
2. **`model_weights.bin`** (or multiple .bin files) - Model weights

### Converting Your Model:

#### From TensorFlow/Keras (.h5 or SavedModel):
```bash
# Install tensorflowjs converter
pip install tensorflowjs

# Convert Keras model
tensorflowjs_converter --input_format=keras path/to/your/model.h5 ./public/model

# Convert SavedModel
tensorflowjs_converter --input_format=tf_saved_model path/to/saved_model ./public/model
```

#### From Python Script:
```python
import tensorflowjs as tfjs
import tensorflow as tf

# Load your trained model
model = tf.keras.models.load_model('your_model.h5')

# Save as TensorFlow.js format
tfjs.converters.save_keras_model(model, './public/model')
```

### Model Requirements:
- **Input Shape**: [batch_size, 224, 224, 3] (RGB images, 224x224 pixels)
- **Output Shape**: [batch_size, num_classes] (class probabilities)
- **Preprocessing**: Images will be automatically resized to 224x224 and normalized to [0,1]

### Fish Classes:
Update the `FISH_CLASSES` array in `TensorFlowFishPredictor.tsx` to match your model's output classes:

```typescript
const FISH_CLASSES = [
  "Mackerel", "Sardine", "Pomfret", "Tuna", "Kingfish", 
  "Snapper", "Grouper", "Barracuda", "Sole", "Anchovy",
  // ... add your actual class names
];
```

### Current Status:
- ❌ **No real model loaded** - placeholder files only
- 📁 Place your converted TensorFlow.js model files here
- 🔄 Component will auto-detect and load valid models

### File Structure:
```
public/model/
├── model.json          # Model architecture (required)
├── model_weights.bin   # Model weights (required) 
└── README.md          # This file
```

### Troubleshooting:
- Ensure model.json and weight files are in `/public/model/`
- Check browser console for loading errors
- Verify model input/output shapes match expected format
- Test with small images first (< 5MB)