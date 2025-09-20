import React, { useState } from 'react';
import { Camera, Upload, Fish, Loader, AlertCircle, CheckCircle } from 'lucide-react';

interface FishPredictionResult {
  predicted_fish: string;
  confidence: number;
  top_predictions: Array<{
    fish: string;
    confidence: number;
  }>;
  success?: boolean;
  error?: string;
  model_type?: string;
}

const FishPrediction: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [prediction, setPrediction] = useState<FishPredictionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      setError(null);
      setPrediction(null);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePrediction = async () => {
    if (!selectedImage) {
      setError('Please select an image first');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedImage);

      console.log('Sending request to:', 'http://localhost:9000/predict_fish');
      console.log('File size:', selectedImage.size, 'bytes');
      console.log('File type:', selectedImage.type);

      const response = await fetch('http://localhost:9000/predict_fish', {
        method: 'POST',
        body: formData,
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const result: FishPredictionResult = await response.json();
      console.log('Prediction result:', result);
      
      if (result.error) {
        setError(result.error);
      } else {
        setPrediction(result);
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to predict fish species. Please check if the backend server is running.');
    } finally {
      setIsLoading(false);
    }
  };

  const resetPrediction = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setPrediction(null);
    setError(null);
  };

  const testConnection = async () => {
    try {
      const response = await fetch('http://localhost:9000/health');
      const data = await response.json();
      console.log('Backend connection test:', data);
      alert(`Backend Status: ${data.status} - Fish Predictor: ${data.fish_predictor_loaded ? 'Loaded' : 'Not Loaded'}`);
    } catch (err) {
      console.error('Connection test failed:', err);
      alert('Failed to connect to backend server');
    }
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Fish className="text-blue-600" size={24} />
          <h2 className="text-xl font-semibold text-gray-800">Fish Species Prediction</h2>
        </div>
        <button
          onClick={testConnection}
          className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded hover:bg-gray-200 transition-colors"
        >
          Test Connection
        </button>
      </div>
      
      {!imagePreview ? (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <Camera className="mx-auto text-gray-400 mb-4" size={48} />
          <p className="text-gray-600 mb-4">Upload an image of a fish to identify its species</p>
          <label className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700 transition-colors">
            <Upload className="mr-2" size={20} />
            Choose Image
            <input
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />
          </label>
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
            onClick={handlePrediction}
            disabled={isLoading}
            className="w-full flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors"
          >
            {isLoading ? (
              <>
                <Loader className="animate-spin mr-2" size={20} />
                Analyzing...
              </>
            ) : (
              <>
                <Fish className="mr-2" size={20} />
                Identify Fish Species
              </>
            )}
          </button>

          {/* Debug Info */}
          <div className="mt-2 text-xs text-gray-500">
            Backend: <span className="font-mono">http://localhost:9000</span>
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
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-3">
                <CheckCircle className="text-green-500" size={20} />
                <h3 className="font-semibold text-green-800">Prediction Results</h3>
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  {prediction.model_type === 'real' ? '🤖 Real AI Model' : 
                   prediction.model_type === 'mock' ? '🎭 Demo Mode' : 
                   '⚠️ Error Mode'}
                </span>
              </div>

              <div className="space-y-3">
                {/* Main Prediction */}
                <div className="bg-white rounded-lg p-3 border">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-800">
                      {prediction.predicted_fish}
                    </span>
                    <span className="text-sm font-semibold text-blue-600">
                      {(prediction.confidence * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>

                {/* Top Predictions */}
                {prediction.top_predictions && prediction.top_predictions.length > 1 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Other Possibilities:</h4>
                    <div className="space-y-2">
                      {prediction.top_predictions.slice(1).map((pred, index) => (
                        <div key={index} className="bg-white rounded-lg p-2 border">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-700">{pred.fish}</span>
                            <span className="text-xs text-gray-500">
                              {(pred.confidence * 100).toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FishPrediction;