import { useState, useEffect } from 'react'
import { X, AlertTriangle, Info } from 'lucide-react'
import { alerts } from '../data/dummyData'

const AlertNotificationBar = () => {
  const [isVisible, setIsVisible] = useState(false)
  const [currentAlert, setCurrentAlert] = useState(null)

  useEffect(() => {
    // Find the most recent government/high priority alert
    const govAlert = alerts.find(alert => 
      alert.isActive && 
      (alert.title.toLowerCase().includes('government') || alert.severity === 'high')
    )
    
    if (govAlert) {
      setCurrentAlert(govAlert)
      setIsVisible(true)
      
      // Auto-hide after 10 seconds
      const timer = setTimeout(() => {
        setIsVisible(false)
      }, 10000)
      
      return () => clearTimeout(timer)
    }
  }, [])

  if (!currentAlert || !isVisible) return null

  const getAlertStyles = (severity) => {
    switch (severity) {
      case 'high': return 'bg-red-600 text-white'
      case 'medium': return 'bg-orange-500 text-white'
      case 'low': return 'bg-blue-600 text-white'
      default: return 'bg-gray-600 text-white'
    }
  }

  const getIcon = (severity) => {
    if (severity === 'high') return AlertTriangle
    return Info
  }

  const Icon = getIcon(currentAlert.severity)

  return (
    <div 
      className={`fixed top-0 left-0 right-0 z-50 transform transition-transform duration-500 ease-in-out ${
        isVisible ? 'translate-y-0' : '-translate-y-full'
      }`}
    >
      <div className={`${getAlertStyles(currentAlert.severity)} px-4 py-3 shadow-lg`}>
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            <Icon size={20} className="flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold truncate">{currentAlert.title}</p>
              <p className="text-xs opacity-90 truncate">{currentAlert.description}</p>
            </div>
          </div>
          <button 
            onClick={() => setIsVisible(false)}
            className="flex-shrink-0 ml-4 hover:opacity-75 transition-opacity"
            aria-label="Close alert"
          >
            <X size={18} />
          </button>
        </div>
      </div>
    </div>
  )
}

export default AlertNotificationBar
