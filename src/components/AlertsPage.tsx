import { AlertTriangle, Cloud, Navigation, Calendar, CheckCircle, Clock } from 'lucide-react'
import { alerts, geofenceAlerts } from '../data/dummyData'
import GeofenceAlertsComponent from './GeofenceAlertsComponent'
import { useState, useEffect } from 'react'
import { geolocationService } from '../services/geolocationService'
import type { GPSCoordinate, GeofenceAlert } from '../data/dummyData'

const AlertsPage = () => {
  const activeAlerts = alerts.filter(alert => alert.isActive)
  const recentAlerts = alerts.filter(alert => !alert.isActive).slice(0, 5)
  
  // Geofencing state
  const [currentLocation, setCurrentLocation] = useState<GPSCoordinate | null>(null)
  const [geofencingEnabled, setGeofencingEnabled] = useState(true)
  const [liveGeofenceAlerts, setLiveGeofenceAlerts] = useState<GeofenceAlert[]>(geofenceAlerts)

  useEffect(() => {
    const initializeGeofencing = async () => {
      if (geofencingEnabled) {
        const hasPermission = await geolocationService.requestPermission()
        if (hasPermission) {
          // Set boundaries for geofencing
          const { geofenceBoundaries } = await import('../data/dummyData')
          geolocationService.setBoundaries(geofenceBoundaries)
          
          // Start watching location
          geolocationService.startWatching(
            (position) => {
              setCurrentLocation(position)
            },
            (alert) => {
              setLiveGeofenceAlerts(prev => [...prev, alert])
            }
          )
        }
      } else {
        geolocationService.stopWatching()
      }
    }

    initializeGeofencing()

    return () => {
      geolocationService.stopWatching()
    }
  }, [geofencingEnabled])

  const handleDismissGeofenceAlert = (alertId: string) => {
    setLiveGeofenceAlerts(prev => 
      prev.map(alert => 
        alert.id === alertId ? { ...alert, isActive: false } : alert
      )
    )
  }

  const handleToggleGeofencing = (enabled: boolean) => {
    setGeofencingEnabled(enabled)
  }

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'weather': return Cloud
      case 'boundary': return Navigation
      case 'seasonal': return Calendar
      default: return AlertTriangle
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200'
      case 'medium': return 'bg-amber-100 text-amber-800 border-amber-200'
      case 'low': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="bg-white rounded-lg p-4 shadow-sm border">
        <h1 className="text-xl font-bold text-gray-800 mb-2">Alerts & Notifications</h1>
        <p className="text-gray-600">Stay informed about weather, boundaries, and regulations</p>
      </div>

      {/* Geofencing Alerts */}
      <GeofenceAlertsComponent
        alerts={liveGeofenceAlerts}
        currentLocation={currentLocation}
        onDismissAlert={handleDismissGeofenceAlert}
        onToggleGeofencing={handleToggleGeofencing}
        geofencingEnabled={geofencingEnabled}
      />

      {/* Active Alerts */}
      <div className="bg-white rounded-lg p-4 shadow-sm border">
        <div className="flex items-center space-x-2 mb-4">
          <AlertTriangle className="text-orange-600" size={20} />
          <h2 className="text-lg font-semibold text-gray-800">Active Alerts</h2>
          <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs font-medium">
            {activeAlerts.length}
          </span>
        </div>

        {activeAlerts.length > 0 ? (
          <div className="space-y-3">
            {activeAlerts.map((alert) => {
              const Icon = getAlertIcon(alert.type)
              return (
                <div
                  key={alert.id}
                  className={`p-4 rounded-lg border-l-4 ${getSeverityColor(alert.severity)}`}
                >
                  <div className="flex items-start space-x-3">
                    <Icon size={20} className="mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-gray-800">{alert.title}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(alert.severity)}`}>
                          {alert.severity}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 mb-2">{alert.description}</p>
                      <div className="flex items-center space-x-2 text-xs text-gray-500">
                        <Clock size={12} />
                        <span>{formatTimestamp(alert.timestamp)}</span>
                        <span className="capitalize">• {alert.type}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <CheckCircle className="mx-auto text-green-500 mb-2" size={48} />
            <p className="text-gray-600">No active alerts</p>
            <p className="text-sm text-gray-500">All systems are operating normally</p>
          </div>
        )}
      </div>

      {/* Recent Alerts */}
      <div className="bg-white rounded-lg p-4 shadow-sm border">
        <div className="flex items-center space-x-2 mb-4">
          <Clock className="text-gray-600" size={20} />
          <h2 className="text-lg font-semibold text-gray-800">Recent Alerts</h2>
        </div>

        <div className="space-y-3">
          {recentAlerts.map((alert) => {
            const Icon = getAlertIcon(alert.type)
            return (
              <div
                key={alert.id}
                className="p-3 bg-gray-50 rounded-lg border border-gray-200"
              >
                <div className="flex items-start space-x-3">
                  <Icon size={18} className="mt-0.5 text-gray-500 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-medium text-gray-700">{alert.title}</h3>
                      <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded-full">
                        Resolved
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{alert.description}</p>
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <Clock size={12} />
                      <span>{formatTimestamp(alert.timestamp)}</span>
                      <span className="capitalize">• {alert.type}</span>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Alert Types Info */}
      <div className="bg-white rounded-lg p-4 shadow-sm border">
        <h2 className="text-lg font-semibold mb-3 text-gray-800">Alert Types</h2>
        <div className="space-y-3">
          <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
            <Cloud className="text-blue-600 mt-0.5" size={18} />
            <div>
              <p className="text-sm font-medium text-blue-800">Weather Alerts</p>
              <p className="text-sm text-blue-700">
                Notifications about weather conditions, storms, and sea state changes.
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
            <Navigation className="text-green-600 mt-0.5" size={18} />
            <div>
              <p className="text-sm font-medium text-green-800">Boundary Alerts</p>
              <p className="text-sm text-green-700">
                Warnings when approaching territorial or restricted fishing zones.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-3 bg-amber-50 rounded-lg">
            <Calendar className="text-amber-600 mt-0.5" size={18} />
            <div>
              <p className="text-sm font-medium text-amber-800">Seasonal Alerts</p>
              <p className="text-sm text-amber-700">
                Information about fishing bans, seasons, and regulatory changes.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AlertsPage
