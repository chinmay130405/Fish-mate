import { useState, useEffect } from 'react'
import { X, Shield, AlertTriangle, MapPin } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import type { GeofenceAlert } from '../services/geofencingService'

interface BoundaryAlertBarProps {
  alerts: GeofenceAlert[]
}

const BoundaryAlertBar = ({ alerts }: BoundaryAlertBarProps) => {
  const [currentAlert, setCurrentAlert] = useState<GeofenceAlert | null>(null)
  const [isVisible, setIsVisible] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    if (alerts.length === 0) {
      setIsVisible(false)
      setCurrentAlert(null)
      return
    }

    // Show the most recent high-severity alert first
    const prioritizedAlerts = alerts
      .sort((a, b) => {
        // Priority: violation > approaching > warning
        const typePriority = { violation: 3, approaching: 2, warning: 1 }
        const severityPriority = { high: 3, medium: 2, low: 1 }
        
        const aPriority = typePriority[a.type] * 10 + severityPriority[a.severity]
        const bPriority = typePriority[b.type] * 10 + severityPriority[b.severity]
        
        if (aPriority !== bPriority) return bPriority - aPriority
        return b.timestamp.getTime() - a.timestamp.getTime()
      })

    const topAlert = prioritizedAlerts[0]
    if (topAlert && topAlert.id !== currentAlert?.id) {
      setCurrentAlert(topAlert)
      setIsVisible(true)
    }
  }, [alerts, currentAlert?.id])

  if (!currentAlert || !isVisible) return null

  const getAlertStyles = () => {
    if (currentAlert.type === 'violation') {
      return {
        container: 'bg-red-600 border-red-700',
        text: 'text-white',
        icon: 'text-red-200'
      }
    }
    if (currentAlert.severity === 'high') {
      return {
        container: 'bg-red-500 border-red-600',
        text: 'text-white',
        icon: 'text-red-200'
      }
    }
    if (currentAlert.severity === 'medium') {
      return {
        container: 'bg-amber-500 border-amber-600',
        text: 'text-white',
        icon: 'text-amber-200'
      }
    }
    return {
      container: 'bg-blue-500 border-blue-600',
      text: 'text-white',
      icon: 'text-blue-200'
    }
  }

  const getAlertIcon = () => {
    if (currentAlert.type === 'violation') {
      return <Shield size={18} />
    }
    if (currentAlert.severity === 'high') {
      return <AlertTriangle size={18} />
    }
    return <MapPin size={18} />
  }

  const getAlertTitle = () => {
    if (currentAlert.type === 'violation') {
      return '⚠️ BOUNDARY VIOLATION'
    }
    if (currentAlert.type === 'approaching') {
      return '📍 APPROACHING BOUNDARY'
    }
    return '🔔 BOUNDARY WARNING'
  }

  const handleAlertClick = () => {
    // Navigate to alerts page with boundary filter
    navigate('/alerts?filter=boundary')
  }

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsVisible(false)
  }

  const styles = getAlertStyles()

  return (
    <div 
      className={`fixed top-0 left-0 right-0 z-50 px-4 py-3 border-b cursor-pointer transform transition-all duration-300 ${styles.container} ${styles.text}`}
      onClick={handleAlertClick}
    >
      <div className="flex items-center justify-between max-w-4xl mx-auto">
        <div className="flex items-center space-x-3 flex-1">
          <div className={styles.icon}>
            {getAlertIcon()}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <span className="font-bold text-sm">
                {getAlertTitle()}
              </span>
              {currentAlert.distance > 0 && (
                <span className="text-xs opacity-90">
                  ({currentAlert.distance.toFixed(1)}km away)
                </span>
              )}
            </div>
            
            <div className="text-sm opacity-90 mt-1 truncate">
              {currentAlert.message}
            </div>
            
            {currentAlert.consequences && (
              <div className="text-xs opacity-80 mt-1">
                ⚠️ {currentAlert.consequences}
              </div>
            )}
          </div>
        </div>

        <button 
          onClick={handleDismiss}
          className="flex-shrink-0 ml-4 hover:opacity-75 transition-opacity"
          aria-label="Close alert"
        >
          <X size={18} />
        </button>
      </div>

      {/* Pulse animation for violations */}
      {currentAlert.type === 'violation' && (
        <div className="absolute inset-0 bg-red-600 opacity-20 animate-pulse pointer-events-none"></div>
      )}
    </div>
  )
}

export default BoundaryAlertBar