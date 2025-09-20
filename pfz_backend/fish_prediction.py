import random
import time
from PIL import Image
import io
import os
import sys
from typing import List, Dict

# Force TensorFlow import at module level
print(f"🐍 Python executable: {sys.executable}")
print(f"📦 Python path: {sys.path}")

try:
    print("🤖 Attempting to import TensorFlow...")
    import tensorflow as tf
    import numpy as np
    TENSORFLOW_AVAILABLE = True
    print(f"✅ TensorFlow {tf.__version__} imported successfully!")
    print(f"📁 TensorFlow location: {tf.__file__}")
except ImportError as e:
    TENSORFLOW_AVAILABLE = False
    print(f"❌ TensorFlow import failed: {e}")
except Exception as e:
    TENSORFLOW_AVAILABLE = False
    print(f"❌ TensorFlow import error: {e}")

class FishPredictor:
    def __init__(self, model_path: str = None):
        """Initialize the fish prediction model"""
        # Default model path - look in parent directory
        if model_path is None:
            current_dir = os.path.dirname(os.path.abspath(__file__))
            model_path = os.path.join(os.path.dirname(current_dir), "fish_mate_model.h5")
        
        self.model_path = model_path
        self.model = None
        
        print(f"🔍 Looking for model at: {model_path}")
        print(f"📁 Model file exists: {os.path.exists(model_path)}")
        
        if TENSORFLOW_AVAILABLE and os.path.exists(model_path):
            try:
                # Try to load the real model
                print(f"🤖 Loading TensorFlow model...")
                self.model = tf.keras.models.load_model(model_path)
                print(f"✅ Real fish prediction model loaded successfully from {model_path}")
                self.use_real_model = True
            except Exception as e:
                print(f"❌ Error loading real model: {e}")
                print("🔄 Falling back to mock model")
                self.model = "mock_model"
                self.use_real_model = False
        else:
            if not TENSORFLOW_AVAILABLE:
                print("🔄 Using mock model (TensorFlow not available)")
            elif not os.path.exists(model_path):
                print(f"🔄 Using mock model (Model file not found at {model_path})")
            self.model = "mock_model"
            self.use_real_model = False
        
        # Common fish species that the model might predict
        # Update these based on your actual model's output classes
        self.fish_classes = [
            "Mackerel", "Sardine", "Pomfret", "Tuna", "Kingfish", 
            "Snapper", "Grouper", "Barracuda", "Sole", "Anchovy",
            "Hilsa", "Rohu", "Catla", "Mrigal", "Carp"
        ]
    
    def preprocess_image(self, image_bytes: bytes):
        """Preprocess the image for model prediction"""
        try:
            # Open image from bytes
            image = Image.open(io.BytesIO(image_bytes))
            
            # Convert to RGB if necessary
            if image.mode != 'RGB':
                image = image.convert('RGB')
            
            if self.use_real_model and TENSORFLOW_AVAILABLE:
                # Real model preprocessing
                # Resize to model input size (adjust based on your model's requirements)
                image = image.resize((224, 224))  # Common size, adjust if needed
                
                # Convert to numpy array and normalize
                image_array = np.array(image) / 255.0
                
                # Add batch dimension
                image_array = np.expand_dims(image_array, axis=0)
                
                return image_array
            else:
                # Mock preprocessing - just validate the image
                return True
                
        except Exception as e:
            raise ValueError(f"Error preprocessing image: {e}")
    
    def predict_fish(self, image_bytes: bytes) -> Dict:
        """Predict fish species from image"""
        if self.model is None:
            return {
                "error": "Model not loaded",
                "predicted_fish": "Unknown",
                "confidence": 0.0,
                "top_predictions": []
            }
        
        try:
            # Preprocess image
            processed_image = self.preprocess_image(image_bytes)
            
            if self.use_real_model and TENSORFLOW_AVAILABLE:
                # Use real TensorFlow model
                predictions = self.model.predict(processed_image, verbose=0)
                predicted_class_idx = np.argmax(predictions[0])
                confidence = float(predictions[0][predicted_class_idx])
                
                # Get top 3 predictions
                top_indices = np.argsort(predictions[0])[::-1][:3]
                top_predictions = []
                
                for idx in top_indices:
                    if idx < len(self.fish_classes):
                        top_predictions.append({
                            "fish": self.fish_classes[idx],
                            "confidence": float(predictions[0][idx])
                        })
                
                # Get predicted fish name
                predicted_fish = self.fish_classes[predicted_class_idx] if predicted_class_idx < len(self.fish_classes) else "Unknown"
                
                return {
                    "predicted_fish": predicted_fish,
                    "confidence": confidence,
                    "top_predictions": top_predictions,
                    "success": True,
                    "model_type": "real"
                }
            else:
                # Mock prediction (current behavior)
                time.sleep(1)  # Simulate processing time
                
                # Generate mock predictions
                predicted_fish = random.choice(self.fish_classes)
                confidence = random.uniform(0.7, 0.95)
                
                # Generate top 3 predictions
                top_predictions = []
                selected_fish = random.sample(self.fish_classes, min(3, len(self.fish_classes)))
                
                for i, fish in enumerate(selected_fish):
                    if i == 0:  # First one is the main prediction
                        top_predictions.append({
                            "fish": predicted_fish,
                            "confidence": confidence
                        })
                    else:
                        top_predictions.append({
                            "fish": fish,
                            "confidence": random.uniform(0.2, confidence - 0.1)
                        })
                
                # Sort by confidence
                top_predictions.sort(key=lambda x: x['confidence'], reverse=True)
                
                return {
                    "predicted_fish": predicted_fish,
                    "confidence": confidence,
                    "top_predictions": top_predictions,
                    "success": True,
                    "model_type": "mock"
                }
            
        except Exception as e:
            return {
                "error": str(e),
                "predicted_fish": "Unknown",
                "confidence": 0.0,
                "top_predictions": [],
                "model_type": "error"
            }

# Initialize the fish predictor
fish_predictor = FishPredictor()
