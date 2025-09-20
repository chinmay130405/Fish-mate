import { useState, useEffect } from 'react'
import { X, AlertTriangle, Info } from 'lucide-react'
import { alerts } from '../data/dummyData'
import type { Alert } from '../data/dummyData'
import { useNavigate } from 'react-router-dom';

const AlertNotificationBar = () => {
  const [isVisible, setIsVisible] = useState(false)
  const [currentAlert, setCurrentAlert] = useState<Alert | null>(null)
  const navigate = useNavigate();

  useEffect(() => {
    // Show the latest active alert (by timestamp)
    const latestAlert = alerts
      .filter(alert => alert.isActive)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];

    if (latestAlert) {
      setCurrentAlert(latestAlert);
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [])

  if (!currentAlert || !isVisible) return null

  const getAlertStyles = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-600 text-white'
      case 'medium': return 'bg-orange-500 text-white'
      case 'low': return 'bg-blue-600 text-white'
      default: return 'bg-gray-600 text-white'
    }
  }

  const getIcon = (severity: string) => {
    if (severity === 'high') return AlertTriangle
    return Info
  }

  const Icon = getIcon(currentAlert.severity)

  return (
    <div 
      className={`fixed top-0 left-0 right-0 z-50 transform transition-transform duration-500 ease-in-out ${
        isVisible ? 'translate-y-0' : '-translate-y-full'
      }`}
      onClick={() => navigate('/alerts')}
      style={{ cursor: 'pointer' }}
    >
      <div className={`${getAlertStyles(currentAlert.severity)} px-2 py-2 sm:px-4 sm:py-3 shadow-lg w-full`}>
        <div className="flex flex-col sm:flex-row items-center justify-between max-w-full sm:max-w-4xl mx-auto gap-2 sm:gap-0">
          <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0 w-full">
            <Icon size={20} className="flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-semibold truncate">{currentAlert.title}</p>
              <p className="text-[10px] sm:text-xs opacity-90 truncate">{currentAlert.description}</p>
            </div>
          </div>
          <button 
            onClick={(e) => {
              e.stopPropagation()
              setIsVisible(false)
            }}
            className="flex-shrink-0 ml-2 sm:ml-4 hover:opacity-75 transition-opacity"
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
