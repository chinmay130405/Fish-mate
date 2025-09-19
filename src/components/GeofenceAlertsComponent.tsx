import React, { useState } from 'react';
import { AlertTriangle, Navigation, MapPin, X, Settings } from 'lucide-react';
import type { GeofenceAlert, GPSCoordinate } from '../data/dummyData';

interface GeofenceAlertsProps {
  alerts: GeofenceAlert[];
  currentLocation?: GPSCoordinate | null;
  onDismissAlert?: (alertId: string) => void;
  onToggleGeofencing?: (enabled: boolean) => void;
  geofencingEnabled?: boolean;
}

export const GeofenceAlertsComponent: React.FC<GeofenceAlertsProps> = ({
  alerts = [],
  currentLocation,
  onDismissAlert,
  onToggleGeofencing,
  geofencingEnabled = true
}) => {
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set());
  const [showSettings, setShowSettings] = useState(false);

  const activeAlerts = alerts.filter(
    alert => alert.isActive && !dismissedAlerts.has(alert.id)
  );

  const handleDismiss = (alertId: string) => {
    setDismissedAlerts(prev => new Set(prev).add(alertId));
    onDismissAlert?.(alertId);
  };

  const getSeverityStyles = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'medium':
        return 'bg-amber-50 border-amber-200 text-amber-800';
      case 'low':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getAlertIcon = (type: string, severity: string) => {
    const iconSize = 20;
    const iconColor = severity === 'high' ? 'text-red-600' : 
                     severity === 'medium' ? 'text-amber-600' : 'text-blue-600';

    switch (type) {
      case 'geofence_entry':
      case 'geofence_exit':
        return <Navigation className={iconColor} size={iconSize} />;
      case 'boundary_warning':
        return <AlertTriangle className={iconColor} size={iconSize} />;
      default:
        return <MapPin className={iconColor} size={iconSize} />;
    }
  };

  const formatLocation = (location: GPSCoordinate) => {
    return `${location.latitude.toFixed(4)}°, ${location.longitude.toFixed(4)}°`;
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className="space-y-3">
      {/* Geofencing Status Header */}
      <div className="bg-white rounded-lg p-4 shadow-sm border">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Navigation className={geofencingEnabled ? 'text-green-600' : 'text-gray-400'} size={20} />
            <div>
              <h3 className="font-semibold text-gray-800">Geofencing</h3>
              <p className="text-sm text-gray-600">
                {geofencingEnabled ? 'Active - Monitoring boundaries' : 'Disabled'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <Settings size={16} className="text-gray-600" />
          </button>
        </div>

        {showSettings && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-700">Enable Geofencing</p>
                <p className="text-sm text-gray-500">Monitor boundary crossings and restricted areas</p>
              </div>
              <button
                onClick={() => onToggleGeofencing?.(!geofencingEnabled)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  geofencingEnabled ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    geofencingEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Current Location Display */}
      {currentLocation && (
        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <div className="flex items-center space-x-2 mb-2">
            <MapPin className="text-blue-600" size={16} />
            <h4 className="font-medium text-gray-800">Current Location</h4>
          </div>
          <p className="text-sm text-gray-600 font-mono">
            {formatLocation(currentLocation)}
          </p>
          {currentLocation.accuracy && (
            <p className="text-xs text-gray-500 mt-1">
              Accuracy: ±{Math.round(currentLocation.accuracy)}m
            </p>
          )}
        </div>
      )}

      {/* Active Geofence Alerts */}
      {activeAlerts.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-semibold text-gray-800 flex items-center space-x-2">
            <AlertTriangle className="text-orange-600" size={16} />
            <span>Boundary Alerts ({activeAlerts.length})</span>
          </h4>
          
          {activeAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`rounded-lg p-4 border ${getSeverityStyles(alert.severity)} relative`}
            >
              <button
                onClick={() => handleDismiss(alert.id)}
                className="absolute top-2 right-2 p-1 rounded-full hover:bg-black/10 transition-colors"
              >
                <X size={14} />
              </button>

              <div className="flex items-start space-x-3 pr-8">
                {getAlertIcon(alert.type, alert.severity)}
                <div className="flex-1">
                  <h5 className="font-semibold text-sm mb-1">{alert.title}</h5>
                  <p className="text-sm mb-2">{alert.description}</p>
                  
                  <div className="flex items-center justify-between text-xs opacity-75">
                    <span>Boundary: {alert.boundaryName}</span>
                    <span>{formatTimestamp(alert.timestamp)}</span>
                  </div>
                  
                  <div className="text-xs opacity-75 mt-1 font-mono">
                    Location: {formatLocation(alert.location)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* No Active Alerts */}
      {activeAlerts.length === 0 && geofencingEnabled && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <p className="text-green-800 font-medium">All Clear</p>
          </div>
          <p className="text-green-700 text-sm mt-1">
            No boundary violations detected. You are operating within safe zones.
          </p>
        </div>
      )}

      {/* Geofencing Disabled Message */}
      {!geofencingEnabled && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
            <p className="text-gray-700 font-medium">Geofencing Disabled</p>
          </div>
          <p className="text-gray-600 text-sm mt-1">
            Enable geofencing to monitor boundary crossings and receive alerts.
          </p>
        </div>
      )}
    </div>
  );
};

export default GeofenceAlertsComponent;
