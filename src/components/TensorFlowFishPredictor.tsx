import React, { useState, useEffect } from 'react';
import * as tf from '@tensorflow/tfjs';
import { Camera, Upload, Fish, Loader, AlertCircle, CheckCircle, Brain } from 'lucide-react';

// Fish class names - update these based on your actual model's classes
const FISH_CLASSES = [
  "Mackerel", "Sardine", "Pomfret", "Tuna", "Kingfish", 
  "Snapper", "Grouper", "Barracuda", "Sole", "Anchovy",
  "Hilsa", "Rohu", "Catla", "Mrigal", "Carp"
];

interface PredictionResult {
  className: string;
  confidence: number;
  classIndex: number;
}

const TensorFlowFishPredictor: React.FC = () => {
  const [model, setModel] = useState<tf.LayersModel | null>(null);
  const [modelLoading, setModelLoading] = useState(false);
  const [modelError, setModelError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [topPredictions, setTopPredictions] = useState<PredictionResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Load TensorFlow.js model on component mount
  useEffect(() => {
    const loadModel = async () => {
      setModelLoading(true);
      setModelError(null);
      
      try {
        console.log('🤖 Attempting to load TensorFlow.js model...');
        
        let loadedModel;
        
        // Try multiple model loading approaches
        try {
          console.log('Trying to load from /model/model.json...');
          loadedModel = await tf.loadLayersModel('/model/model.json');
        } catch (error1) {
          console.log('❌ /model/model.json failed, trying alternative paths...');
          
          try {
            // Try loading from different path
            loadedModel = await tf.loadLayersModel('/public/model/model.json');
          } catch (error2) {
            console.log('❌ Alternative paths failed');
            throw new Error('No compatible TensorFlow.js model found. Please convert your .h5 model to TensorFlow.js format.');
          }
        }
        
        console.log('✅ TensorFlow.js model loaded successfully!');
        console.log('Model input shape:', loadedModel.inputs[0].shape);
        console.log('Model output shape:', loadedModel.outputs[0].shape);
        
        setModel(loadedModel);
        
        // Warm up the model with a dummy prediction
        const dummyInput = tf.zeros([1, 224, 224, 3]);
        loadedModel.predict(dummyInput);
        dummyInput.dispose();
        
      } catch (err) {
        console.error('❌ Error loading TensorFlow.js model:', err);
        setModelError(
          `Model conversion needed: Your fish_mate_model.h5 needs to be converted to TensorFlow.js format. ${err instanceof Error ? err.message : ''}`
        );
      } finally {
        setModelLoading(false);
      }
    };

    loadModel();

    // Cleanup function to dispose of model when component unmounts
    return () => {
      if (model) {
        model.dispose();
      }
    };
  }, []);

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      setError(null);
      setPrediction(null);
      setTopPredictions([]);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const preprocessImage = (imageElement: HTMLImageElement): tf.Tensor => {
    // Convert image to tensor and preprocess for model
    const tensor = tf.browser
      .fromPixels(imageElement)
      .resizeNearestNeighbor([224, 224]) // Resize to model input size
      .toFloat()
      .expandDims(0) // Add batch dimension
      .div(255.0); // Normalize to [0, 1]

    return tensor;
  };

  const handlePredict = async () => {
    if (!model || !imagePreview) {
      setError('Model not loaded or no image selected');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Create image element for preprocessing
      const imageElement = document.createElement('img');
      imageElement.crossOrigin = 'anonymous';
      
      await new Promise((resolve, reject) => {
        imageElement.onload = resolve;
        imageElement.onerror = reject;
        imageElement.src = imagePreview;
      });

      console.log('🖼️ Image loaded, preprocessing...');
      
      // Preprocess image
      const preprocessedImage = preprocessImage(imageElement);
      
      console.log('🧠 Running prediction...');
      console.log('Input tensor shape:', preprocessedImage.shape);
      
      // Run prediction
      const predictionTensor = model.predict(preprocessedImage) as tf.Tensor;
      const predictionArray = await predictionTensor.data();
      
      console.log('📊 Raw predictions:', predictionArray);
      
      // Get top predictions
      const predictions: PredictionResult[] = Array.from(predictionArray)
        .map((confidence, index) => ({
          className: FISH_CLASSES[index] || `Class ${index}`,
          confidence,
          classIndex: index
        }))
        .sort((a, b) => b.confidence - a.confidence);
      
      const topPred = predictions[0];
      const top3 = predictions.slice(0, 3);
      
      console.log('🎯 Top prediction:', topPred);
      console.log('🏆 Top 3 predictions:', top3);
      
      setPrediction(topPred);
      setTopPredictions(top3);
      
      // Cleanup tensors
      preprocessedImage.dispose();
      predictionTensor.dispose();
      
    } catch (err) {
      console.error('❌ Prediction error:', err);
      setError(err instanceof Error ? err.message : 'Prediction failed');
    } finally {
      setIsLoading(false);
    }
  };

  const resetPrediction = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setPrediction(null);
    setTopPredictions([]);
    setError(null);
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Brain className="text-purple-600" size={24} />
          <h2 className="text-xl font-semibold text-gray-800">AI Fish Predictor</h2>
          <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
            TensorFlow.js
          </span>
        </div>
        
        {/* Model Status */}
        <div className="flex items-center space-x-2">
          {modelLoading && (
            <>
              <Loader className="animate-spin text-blue-500" size={16} />
              <span className="text-xs text-blue-600">Loading Model...</span>
            </>
          )}
          {model && !modelLoading && (
            <>
              <CheckCircle className="text-green-500" size={16} />
              <span className="text-xs text-green-600">Model Ready</span>
            </>
          )}
          {modelError && (
            <>
              <AlertCircle className="text-red-500" size={16} />
              <span className="text-xs text-red-600">Model Error</span>
            </>
          )}
        </div>
      </div>

      {/* Model Error Display */}
      {modelError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <AlertCircle className="text-red-500" size={20} />
            <div>
              <p className="text-red-700 text-sm font-medium">Model Loading Failed</p>
              <p className="text-red-600 text-xs mt-1">{modelError}</p>
              <div className="text-red-600 text-xs mt-2 space-y-1">
                <p>💡 <strong>Your .h5 model needs conversion to TensorFlow.js format</strong></p>
                <p>🔧 <strong>Solutions:</strong></p>
                <ol className="list-decimal list-inside space-y-1 ml-2">
                  <li>Run <code className="bg-red-100 px-1 rounded">fix_conversion.bat</code> in project root</li>
                  <li>Or manually convert: <code className="bg-red-100 px-1 rounded">tensorflowjs_converter --input_format=keras fish_mate_model.h5 ./public/model/</code></li>
                  <li>Or use the backend API component instead (already working)</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {!imagePreview ? (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <Camera className="mx-auto text-gray-400 mb-4" size={48} />
          <p className="text-gray-600 mb-4">Upload a fish image for AI-powered species identification</p>
          <label className="inline-flex items-center px-6 py-3 bg-purple-600 text-white rounded-lg cursor-pointer hover:bg-purple-700 transition-colors disabled:bg-gray-400">
            <Upload className="mr-2" size={20} />
            Choose Image
            <input
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
              disabled={!model}
            />
          </label>
          {!model && (
            <p className="text-xs text-gray-500 mt-2">Please wait for model to load...</p>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {/* Image Preview */}
          <div className="relative">
            <img
              src={imagePreview}
              alt="Selected fish"
              className="w-full max-h-64 object-contain rounded-lg border"
            />
            <button
              onClick={resetPrediction}
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors"
            >
              ×
            </button>
          </div>

          {/* Prediction Button */}
          <button
            onClick={handlePredict}
            disabled={isLoading || !model}
            className="w-full flex items-center justify-center px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 transition-colors"
          >
            {isLoading ? (
              <>
                <Loader className="animate-spin mr-2" size={20} />
                Analyzing with AI...
              </>
            ) : (
              <>
                <Brain className="mr-2" size={20} />
                Predict Fish Species
              </>
            )}
          </button>

          {/* Model Info */}
          <div className="text-xs text-gray-500 text-center">
            Client-side AI • No data sent to servers • Privacy-first
          </div>

          {/* Error Display */}
          {error && (
            <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="text-red-500" size={20} />
              <span className="text-red-700 text-sm">{error}</span>
            </div>
          )}

          {/* Prediction Results */}
          {prediction && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-3">
                <CheckCircle className="text-purple-500" size={20} />
                <h3 className="font-semibold text-purple-800">AI Prediction Results</h3>
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                  🤖 Client-side AI
                </span>
              </div>

              <div className="space-y-3">
                {/* Main Prediction */}
                <div className="bg-white rounded-lg p-3 border">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-800">
                      {prediction.className}
                    </span>
                    <span className="text-sm font-semibold text-purple-600">
                      {(prediction.confidence * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>

                {/* Top Predictions */}
                {topPredictions.length > 1 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Alternative Predictions:</h4>
                    <div className="space-y-2">
                      {topPredictions.slice(1).map((pred, index) => (
                        <div key={index} className="bg-white rounded-lg p-2 border">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-700">{pred.className}</span>
                            <span className="text-xs text-gray-500">
                              {(pred.confidence * 100).toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Technical Details */}
                <div className="text-xs text-gray-500 space-y-1">
                  <p>🔬 <strong>Technical:</strong> Class {prediction.classIndex} • Raw score: {prediction.confidence.toFixed(4)}</p>
                  <p>⚡ <strong>Processing:</strong> Client-side TensorFlow.js • 224×224 input • Normalized [0,1]</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Instructions */}
      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-blue-800 text-xs">
          <strong>📁 Setup Instructions:</strong> Place your TensorFlow.js model files (model.json + .bin files) 
          in the <code className="bg-blue-200 px-1 rounded">/public/model/</code> folder for this component to work.
        </p>
      </div>
    </div>
  );
};

export default TensorFlowFishPredictor;