import { useState, useEffect } from 'react'
import { Phone, MapPin, Clock } from 'lucide-react'

const SOSButton = () => {
  const [isSOSActive, setIsSOSActive] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [currentLocation, setCurrentLocation] = useState<string>('Getting location...')

  // Get current location for SOS
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude.toFixed(4)
          const lng = position.coords.longitude.toFixed(4)
          setCurrentLocation(`${lat}°N, ${lng}°E`)
        },
        () => {
          setCurrentLocation('Location unavailable')
        }
      )
    }
  }, [])

  const handleSOSPress = () => {
    if (isSOSActive) return
    
    setIsSOSActive(true)
    setCountdown(5)
    
    // Countdown timer
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          triggerSOS()
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const triggerSOS = () => {
    // In a real app, this would:
    // 1. Get GPS coordinates
    // 2. Send SOS signal to coast guard
    // 3. Alert emergency contacts
    // 4. Start emergency tracking
    
    // SOS signal sent silently - no alert popup needed
    setTimeout(() => {
      setIsSOSActive(false)
    }, 3000)
  }

  const cancelSOS = () => {
    setIsSOSActive(false)
    setCountdown(0)
  }

  return (
    <>
      {/* SOS Button - Enhanced Design */}
      <div className="fixed bottom-24 right-4 z-[9999]">
        {/* SOS Button with improved visibility */}
        <button
          onClick={handleSOSPress}
          disabled={isSOSActive && countdown > 0}
          className={`relative w-20 h-20 rounded-full shadow-2xl border-4 transform transition-all duration-300 ${
            isSOSActive 
              ? countdown > 0 
                ? 'bg-gradient-to-r from-yellow-400 to-orange-500 animate-pulse scale-110 border-yellow-200 shadow-yellow-400/50' 
                : 'bg-gradient-to-r from-green-500 to-green-600 animate-bounce border-green-200 shadow-green-400/50'
              : 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 hover:scale-110 active:scale-95 border-red-200 shadow-red-500/50'
          }`}
        >
          {/* Pulsing ring effect for emergency */}
          {isSOSActive && countdown > 0 && (
            <div className="absolute inset-0 rounded-full bg-red-500 opacity-30 animate-ping"></div>
          )}
          
          <div className="flex flex-col items-center justify-center text-white relative z-10">
            <Phone size={24} className="mb-1" />
            <span className="text-xs font-bold">
              {isSOSActive 
                ? countdown > 0 
                  ? countdown 
                  : '✓'
                : 'SOS'
              }
            </span>
          </div>
          
          {/* Emergency indicator */}
          {!isSOSActive && (
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            </div>
          )}
        </button>
        
        {/* Helper text */}
        {!isSOSActive && (
          <div className="absolute bottom-full right-0 mb-2 bg-black/75 text-white px-2 py-1 rounded text-xs whitespace-nowrap opacity-0 hover:opacity-100 transition-opacity pointer-events-none">
            Emergency SOS
          </div>
        )}
      </div>

      {/* Enhanced SOS Modal */}
      {isSOSActive && countdown > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[99999] p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl border-2 border-red-200">
            <div className="text-center">
              {/* Animated Emergency Icon */}
              <div className="relative w-20 h-20 mx-auto mb-6">
                <div className="absolute inset-0 bg-red-600 rounded-full animate-ping opacity-30"></div>
                <div className="relative w-20 h-20 bg-red-600 rounded-full flex items-center justify-center animate-pulse">
                  <Phone size={36} className="text-white" />
                </div>
              </div>
              
              {/* Alert Header */}
              <h2 className="text-2xl font-bold text-red-600 mb-2">🚨 EMERGENCY SOS 🚨</h2>
              
              {/* Countdown Display */}
              <div className="bg-red-50 rounded-lg p-4 mb-4 border-2 border-red-200">
                <p className="text-gray-700 mb-2">
                  Emergency signal will be sent in
                </p>
                <div className="text-6xl font-bold text-red-600 animate-bounce">
                  {countdown}
                </div>
                <p className="text-sm text-gray-600 mt-2">seconds</p>
              </div>
              
              {/* Emergency Details */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-3 text-left">
                <div className="flex items-center space-x-3">
                  <MapPin size={16} className="text-red-600 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-gray-800">Location Sharing</p>
                    <p className="text-xs text-gray-600">{currentLocation}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Clock size={16} className="text-red-600 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-gray-800">Coast Guard Alert</p>
                    <p className="text-xs text-gray-600">Maritime rescue will be coordinated</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone size={16} className="text-red-600 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-gray-800">Emergency Contacts</p>
                    <p className="text-xs text-gray-600">Family and authorities will be notified</p>
                  </div>
                </div>
              </div>
              
              {/* Cancel Button */}
              <button
                onClick={cancelSOS}
                className="w-full bg-gray-700 text-white py-4 px-6 rounded-xl font-bold text-lg hover:bg-gray-800 transition-all duration-200 transform hover:scale-105"
              >
                ❌ CANCEL SOS
              </button>
              
              <p className="text-xs text-gray-500 mt-3">
                Only cancel if this is not a real emergency
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default SOSButton
