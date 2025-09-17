import { useState } from 'react'
import { Phone, MapPin, Clock } from 'lucide-react'

const SOSButton = () => {
  const [isSOSActive, setIsSOSActive] = useState(false)
  const [countdown, setCountdown] = useState(0)

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
    alert('SOS Alert Sent!\n\nLocation: 18.85°N, 72.30°E\nTime: ' + new Date().toLocaleTimeString() + '\n\nCoast Guard and emergency contacts have been notified.')
    
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
      {/* SOS Button */}
      <button
        onClick={handleSOSPress}
        disabled={isSOSActive && countdown > 0}
        className={`fixed bottom-20 right-4 w-16 h-16 rounded-full shadow-lg border-4 border-white transform transition-all duration-200 z-40 ${
          isSOSActive 
            ? countdown > 0 
              ? 'bg-yellow-500 animate-pulse scale-110' 
              : 'bg-green-600 animate-bounce'
            : 'bg-red-600 hover:bg-red-700 hover:scale-105 active:scale-95'
        }`}
        style={{ 
          background: isSOSActive 
            ? countdown > 0 
              ? '#eab308' 
              : '#16a34a'
            : '#dc2626'
        }}
      >
        <div className="flex flex-col items-center justify-center text-white">
          <Phone size={20} className="mb-1" />
          <span className="text-xs font-bold">
            {isSOSActive 
              ? countdown > 0 
                ? countdown 
                : '✓'
              : 'SOS'
            }
          </span>
        </div>
      </button>

      {/* SOS Modal */}
      {isSOSActive && countdown > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                <Phone size={32} className="text-white" />
              </div>
              
              <h2 className="text-xl font-bold text-red-600 mb-2">SOS Alert</h2>
              <p className="text-gray-700 mb-4">
                Emergency signal will be sent in <span className="font-bold text-red-600 text-2xl">{countdown}</span> seconds
              </p>
              
              <div className="space-y-2 text-sm text-gray-600 mb-6">
                <div className="flex items-center justify-center space-x-1">
                  <MapPin size={14} />
                  <span>Location will be shared</span>
                </div>
                <div className="flex items-center justify-center space-x-1">
                  <Clock size={14} />
                  <span>Coast Guard will be notified</span>
                </div>
              </div>
              
              <button
                onClick={cancelSOS}
                className="w-full bg-gray-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-gray-700 transition-colors"
              >
                Cancel SOS
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default SOSButton
