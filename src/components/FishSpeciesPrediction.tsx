import { useState, useRef } from 'react'
import { Camera, Upload, X, Fish, Loader2 } from 'lucide-react'

interface PredictionResult {
  species: string
  confidence: number
  otherPossibilities?: { species: string; confidence: number }[]
}

const FishSpeciesPrediction = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [predictionResult, setPredictionResult] = useState<PredictionResult | null>(null)
  const [isDemoMode, setIsDemoMode] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  // Demo data similar to what's shown in the image
  const demoResult: PredictionResult = {
    species: 'Catla',
    confidence: 72.9,
    otherPossibilities: [
      { species: 'Mackerel', confidence: 56.2 },
      { species: 'Catla', confidence: 51.5 }
    ]
  }

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string)
        setPredictionResult(null)
      }
      reader.readAsDataURL(file)
    }
  }

  const processPrediction = async () => {
    if (!selectedImage) return

    setIsProcessing(true)
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // For demo purposes, use the demo result
    // In production, this would call your fish identification API
    setPredictionResult(demoResult)
    setIsDemoMode(true)
    setIsProcessing(false)
  }

  const resetPrediction = () => {
    setSelectedImage(null)
    setPredictionResult(null)
    setIsDemoMode(false)
    setIsProcessing(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
    if (cameraInputRef.current) cameraInputRef.current.value = ''
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 70) return 'text-green-600'
    if (confidence >= 50) return 'text-yellow-600'
    return 'text-red-500'
  }

  const getConfidenceBarColor = (confidence: number) => {
    if (confidence >= 70) return 'bg-green-500'
    if (confidence >= 50) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm border">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Fish className="text-blue-600" size={20} />
          <h2 className="text-lg font-semibold text-gray-800">Fish Species Prediction</h2>
        </div>
        {isDemoMode && (
          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">Demo Mode</span>
        )}
      </div>

      {!selectedImage ? (
        /* Upload Section */
        <div className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
            <Fish className="mx-auto mb-4 text-gray-400" size={48} />
            <p className="text-gray-600 mb-4">Upload or take a photo to identify fish species</p>
            
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Upload size={16} />
                <span>Upload Photo</span>
              </button>
              
              <button
                onClick={() => cameraInputRef.current?.click()}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Camera size={16} />
                <span>Take Photo</span>
              </button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />
            
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleImageSelect}
              className="hidden"
            />
          </div>
        </div>
      ) : (
        /* Image Preview and Results Section */
        <div className="space-y-4">
          {/* Image Preview */}
          <div className="relative">
            <img
              src={selectedImage}
              alt="Fish to identify"
              className="w-full h-48 object-cover rounded-lg border"
            />
            <button
              onClick={resetPrediction}
              className="absolute top-2 right-2 p-1 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-75"
            >
              <X size={16} />
            </button>
          </div>

          {/* Identify Button */}
          {!predictionResult && !isProcessing && (
            <button
              onClick={processPrediction}
              className="w-full flex items-center justify-center space-x-2 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Fish size={18} />
              <span>Identify Fish Species</span>
            </button>
          )}

          {/* Processing State */}
          {isProcessing && (
            <div className="flex items-center justify-center space-x-2 py-8">
              <Loader2 className="animate-spin text-blue-600" size={24} />
              <span className="text-gray-600">Processing image...</span>
            </div>
          )}

          {/* Prediction Results */}
          {predictionResult && (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-800">Prediction Results</h3>
                  <span className="text-xs text-green-600">✓ Analysis Complete</span>
                </div>
                
                {/* Main Prediction */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-lg">{predictionResult.species}</span>
                    <span className={`font-bold text-lg ${getConfidenceColor(predictionResult.confidence)}`}>
                      {predictionResult.confidence}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${getConfidenceBarColor(predictionResult.confidence)}`}
                      style={{ width: `${predictionResult.confidence}%` }}
                    ></div>
                  </div>
                </div>

                {/* Other Possibilities */}
                {predictionResult.otherPossibilities && predictionResult.otherPossibilities.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Other Possibilities:</h4>
                    <div className="space-y-2">
                      {predictionResult.otherPossibilities.map((possibility, index) => (
                        <div key={index} className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">{possibility.species}</span>
                          <span className={`font-medium ${getConfidenceColor(possibility.confidence)}`}>
                            {possibility.confidence}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex space-x-2 mt-4">
                  <button
                    onClick={resetPrediction}
                    className="flex-1 py-2 px-4 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Try Another
                  </button>
                  <button
                    onClick={() => {
                      // In a real app, this would save to fishing log
                      alert(`${predictionResult.species} saved to your fishing log!`)
                    }}
                    className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Save to Log
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Info Footer */}
      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <p className="text-xs text-blue-700">
          <strong>💡 Tip:</strong> For better accuracy, ensure good lighting and clear view of the fish. 
          This helps our AI model identify species more precisely.
        </p>
      </div>
    </div>
  )
}

export default FishSpeciesPrediction