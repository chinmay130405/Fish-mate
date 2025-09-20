import { useState, useEffect } from 'react'
import { Play, Square, MapPin, Clock, Fuel, Leaf, TrendingUp } from 'lucide-react'
import { journeyTrackingService, type JourneyData } from '../services/journeyTrackingService'
import type { GPSCoordinate } from '../data/dummyData'

interface JourneyTrackerProps {
  currentLocation?: GPSCoordinate | null
}

const JourneyTracker = ({ currentLocation }: JourneyTrackerProps) => {
  const [currentJourney, setCurrentJourney] = useState<JourneyData | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Check for active journey on component mount
    const activeJourney = journeyTrackingService.getCurrentJourney()
    setCurrentJourney(activeJourney)

    // Set up polling for journey updates
    const interval = setInterval(() => {
      const journey = journeyTrackingService.getCurrentJourney()
      setCurrentJourney(journey)
    }, 5000) // Update every 5 seconds

    return () => clearInterval(interval)
  }, [])

  const handleStartJourney = async () => {
    try {
      setIsLoading(true)
      
      // Try to get current location or use existing one
      let location = currentLocation
      if (!location) {
        // Try to get location with a shorter timeout
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            timeout: 5000,
            enableHighAccuracy: false,
            maximumAge: 300000 // 5 minutes
          })
        })
        location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: Date.now()
        }
      }

      const journeyId = journeyTrackingService.startJourney({
        latitude: location.latitude,
        longitude: location.longitude
      })
      
      const journey = journeyTrackingService.getCurrentJourney()
      setCurrentJourney(journey)
      
      console.log('Journey started:', journeyId)
    } catch (error) {
      if (error instanceof GeolocationPositionError || (error as any).code) {
        alert('Unable to get GPS location. Journey will start without initial position.')
        // Start journey without location
        try {
          journeyTrackingService.startJourney()
          const journey = journeyTrackingService.getCurrentJourney()
          setCurrentJourney(journey)
        } catch (serviceError) {
          alert('Failed to start journey: ' + (serviceError as Error).message)
        }
      } else {
        alert('Failed to start journey: ' + (error as Error).message)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleStopJourney = async () => {
    if (!currentJourney) return

    try {
      setIsLoading(true)
      const completedJourney = journeyTrackingService.stopJourney(
        currentLocation ? {
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude
        } : undefined
      )
      
      setCurrentJourney(null)
      
      if (completedJourney) {
        alert(`Journey completed! 
Distance: ${completedJourney.distance.toFixed(2)} km
Duration: ${completedJourney.duration} minutes
Fuel Used: ${completedJourney.estimatedFuelUsed.toFixed(2)} L
Efficiency Score: ${completedJourney.fuelEfficiencyScore}/100
Carbon Footprint: ${completedJourney.carbonFootprint.toFixed(2)} kg CO₂`)
      }
    } catch (error) {
      alert('Failed to stop journey: ' + (error as Error).message)
    } finally {
      setIsLoading(false)
    }
  }

  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}h ${mins}m`
    }
    return `${mins}m`
  }

  const getEfficiencyColor = (score: number): string => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getEfficiencyBgColor = (score: number): string => {
    if (score >= 80) return 'bg-green-50 border-green-200'
    if (score >= 60) return 'bg-yellow-50 border-yellow-200'
    return 'bg-red-50 border-red-200'
  }

  if (!currentJourney) {
    // Journey Start Screen
    return (
      <div className="bg-white rounded-lg p-6 shadow-sm border">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Play className="text-green-600" size={32} />
          </div>
          
          <h3 className="text-lg font-bold text-gray-800 mb-2">Start Your Eco-Journey</h3>
          <p className="text-sm text-gray-600 mb-4">
            Track your fishing trip for fuel efficiency and environmental impact
          </p>
          
          <div className="grid grid-cols-3 gap-3 mb-6 text-xs">
            <div className="text-center">
              <Fuel className="text-blue-600 mx-auto mb-1" size={16} />
              <span className="text-gray-600">Save Fuel</span>
            </div>
            <div className="text-center">
              <Leaf className="text-green-600 mx-auto mb-1" size={16} />
              <span className="text-gray-600">Reduce CO₂</span>
            </div>
            <div className="text-center">
              <TrendingUp className="text-purple-600 mx-auto mb-1" size={16} />
              <span className="text-gray-600">Track Progress</span>
            </div>
          </div>
          
          <button
            onClick={handleStartJourney}
            disabled={isLoading || !currentLocation}
            className={`w-full py-3 px-4 rounded-lg font-semibold flex items-center justify-center space-x-2 transition-colors ${
              isLoading || !currentLocation
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            <Play size={20} />
            <span>{isLoading ? 'Starting...' : 'Start Journey'}</span>
          </button>
          
          {!currentLocation && (
            <p className="text-xs text-red-600 mt-2">GPS location required</p>
          )}
        </div>
      </div>
    )
  }

  // Active Journey Screen
  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border">
      <div className="text-center mb-4">
        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3 animate-pulse">
          <div className="w-3 h-3 bg-red-500 rounded-full animate-ping"></div>
        </div>
        <h3 className="text-lg font-bold text-gray-800">Journey in Progress</h3>
        <p className="text-xs text-gray-500">Started at {currentJourney.startTime.toLocaleTimeString()}</p>
      </div>

      {/* Real-time Stats */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-blue-50 rounded-lg p-3 text-center border border-blue-200">
          <MapPin className="text-blue-600 mx-auto mb-1" size={16} />
          <div className="text-lg font-bold text-blue-600">{currentJourney.distance.toFixed(1)} km</div>
          <div className="text-xs text-gray-600">Distance</div>
        </div>
        
        <div className="bg-purple-50 rounded-lg p-3 text-center border border-purple-200">
          <Clock className="text-purple-600 mx-auto mb-1" size={16} />
          <div className="text-lg font-bold text-purple-600">{formatDuration(currentJourney.duration)}</div>
          <div className="text-xs text-gray-600">Duration</div>
        </div>
        
        <div className="bg-orange-50 rounded-lg p-3 text-center border border-orange-200">
          <Fuel className="text-orange-600 mx-auto mb-1" size={16} />
          <div className="text-lg font-bold text-orange-600">{currentJourney.estimatedFuelUsed.toFixed(1)} L</div>
          <div className="text-xs text-gray-600">Fuel Used</div>
        </div>
        
        <div className={`rounded-lg p-3 text-center border ${getEfficiencyBgColor(currentJourney.fuelEfficiencyScore)}`}>
          <Leaf className={`mx-auto mb-1 ${getEfficiencyColor(currentJourney.fuelEfficiencyScore)}`} size={16} />
          <div className={`text-lg font-bold ${getEfficiencyColor(currentJourney.fuelEfficiencyScore)}`}>
            {currentJourney.fuelEfficiencyScore}/100
          </div>
          <div className="text-xs text-gray-600">Efficiency</div>
        </div>
      </div>

      {/* Environmental Impact */}
      <div className="bg-green-50 rounded-lg p-3 mb-4 border border-green-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Leaf className="text-green-600" size={16} />
            <span className="text-sm font-medium text-green-800">Carbon Footprint</span>
          </div>
          <span className="text-sm font-bold text-green-600">
            {currentJourney.carbonFootprint.toFixed(2)} kg CO₂
          </span>
        </div>
      </div>

      {/* Stop Button */}
      <button
        onClick={handleStopJourney}
        disabled={isLoading}
        className={`w-full py-3 px-4 rounded-lg font-semibold flex items-center justify-center space-x-2 transition-colors ${
          isLoading
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-red-600 text-white hover:bg-red-700'
        }`}
      >
        <Square size={20} />
        <span>{isLoading ? 'Stopping...' : 'End Journey'}</span>
      </button>
    </div>
  )
}

export default JourneyTracker