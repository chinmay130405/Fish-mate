import { useState } from 'react'
import { checkGeofenceStatus, formatDistance } from '../services/geofencingService'
import { boundaryZones } from '../data/boundaryData'
import type { GeofenceAlert } from '../services/geofencingService'

// Test locations - some inside boundaries, some approaching, some safe
const testLocations = [
  { name: 'Safe Location - Mumbai Coast', lat: 19.0760, lon: 72.8777 },
  { name: 'Near Pakistan Border (High Risk)', lat: 24.1, lon: 67.8 },
  { name: 'Inside Mumbai Naval Zone', lat: 18.95, lon: 72.75 },
  { name: 'Approaching Sri Lanka Border', lat: 8.8, lon: 79.7 },
  { name: 'Safe - Kerala Coast', lat: 10.5, lon: 76.0 },
  { name: 'Near EEZ Boundary', lat: 22.0, lon: 68.5 },
  { name: 'Gulf of Mannar Protected Area', lat: 9.0, lon: 79.0 },
]

interface GeofenceTestPanelProps {
  isVisible: boolean
  onClose: () => void
}

const GeofenceTestPanel = ({ isVisible, onClose }: GeofenceTestPanelProps) => {
  const [selectedLocation, setSelectedLocation] = useState<typeof testLocations[0] | null>(null)
  const [testResults, setTestResults] = useState<{
    activeAlerts: GeofenceAlert[]
    nearbyBoundaries: any[]
    isInsideBoundary: boolean
  } | null>(null)

  const runTest = (location: typeof testLocations[0]) => {
    setSelectedLocation(location)
    const results = checkGeofenceStatus([location.lat, location.lon])
    setTestResults(results)
  }

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800">Geofencing Test Panel</h2>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>

          {/* Test Locations */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3 text-gray-800">Test Locations</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {testLocations.map((location, index) => (
                <button
                  key={index}
                  onClick={() => runTest(location)}
                  className="p-3 text-left border rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors"
                >
                  <div className="font-medium text-sm text-gray-800">{location.name}</div>
                  <div className="text-xs text-gray-500">
                    {location.lat.toFixed(4)}, {location.lon.toFixed(4)}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Test Results */}
          {testResults && selectedLocation && (
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-3 text-gray-800">
                Results for: {selectedLocation.name}
              </h3>
              
              <div className="space-y-4">
                {/* Overall Status */}
                <div className={`p-4 rounded-lg ${
                  testResults.isInsideBoundary ? 'bg-red-100 border-red-300' :
                  testResults.activeAlerts.length > 0 ? 'bg-amber-100 border-amber-300' :
                  'bg-green-100 border-green-300'
                } border`}>
                  <div className="flex items-center space-x-2">
                    <span className="text-xl">
                      {testResults.isInsideBoundary ? '🚫' : testResults.activeAlerts.length > 0 ? '⚠️' : '✅'}
                    </span>
                    <span className="font-medium">
                      {testResults.isInsideBoundary ? 'Inside Restricted Zone!' :
                       testResults.activeAlerts.length > 0 ? `${testResults.activeAlerts.length} Alert(s)` :
                       'Safe Zone'}
                    </span>
                  </div>
                </div>

                {/* Active Alerts */}
                {testResults.activeAlerts.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2 text-gray-800">Active Alerts:</h4>
                    <div className="space-y-2">
                      {testResults.activeAlerts.map((alert: GeofenceAlert, index: number) => (
                        <div key={index} className={`p-3 rounded-lg border ${
                          alert.type === 'violation' ? 'bg-red-50 border-red-200' :
                          alert.severity === 'high' ? 'bg-amber-50 border-amber-200' :
                          'bg-blue-50 border-blue-200'
                        }`}>
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="font-medium text-sm">{alert.boundaryName}</div>
                              <div className="text-xs text-gray-600 mt-1">{alert.message}</div>
                              {alert.consequences && (
                                <div className="text-xs text-red-600 mt-1 bg-red-100 p-1 rounded">
                                  ⚠️ {alert.consequences}
                                </div>
                              )}
                            </div>
                            <div className="ml-2 text-right">
                              <div className={`text-xs font-medium px-2 py-1 rounded ${
                                alert.type === 'violation' ? 'bg-red-200 text-red-800' :
                                alert.severity === 'high' ? 'bg-amber-200 text-amber-800' :
                                'bg-blue-200 text-blue-800'
                              }`}>
                                {alert.type.toUpperCase()}
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                {formatDistance(alert.distance)}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Nearby Boundaries */}
                {testResults.nearbyBoundaries.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2 text-gray-800">Nearby Boundaries:</h4>
                    <div className="space-y-1">
                      {testResults.nearbyBoundaries.map((nearby, index) => (
                        <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                          <span className="text-sm">{nearby.boundary.name}</span>
                          <span className="text-xs font-medium text-gray-600">
                            {formatDistance(nearby.distance)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Boundary Info */}
                <div>
                  <h4 className="font-medium mb-2 text-gray-800">All Boundaries Status:</h4>
                  <div className="max-h-40 overflow-y-auto space-y-1">
                    {boundaryZones.map((boundary, index) => {
                      const alert = testResults.activeAlerts.find((a: GeofenceAlert) => a.boundaryId === boundary.id)
                      const nearby = testResults.nearbyBoundaries.find(n => n.boundary.id === boundary.id)
                      
                      return (
                        <div key={index} className="flex justify-between items-center p-2 text-xs border rounded">
                          <div className="flex-1">
                            <span className={`font-medium ${
                              alert ? 'text-red-600' : nearby ? 'text-amber-600' : 'text-gray-600'
                            }`}>
                              {boundary.name}
                            </span>
                            <span className={`ml-2 px-1 py-0.5 rounded text-xs ${
                              boundary.severity === 'high' ? 'bg-red-100 text-red-700' :
                              boundary.severity === 'medium' ? 'bg-amber-100 text-amber-700' :
                              'bg-green-100 text-green-700'
                            }`}>
                              {boundary.type}
                            </span>
                          </div>
                          <span className="text-gray-500">
                            {alert ? formatDistance(alert.distance) :
                             nearby ? formatDistance(nearby.distance) : 'Safe'}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default GeofenceTestPanel