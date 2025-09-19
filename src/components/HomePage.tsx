import { MapPin, Thermometer, Activity, Fish, Navigation, Satellite } from 'lucide-react'
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap, useMapEvent } from 'react-leaflet'
import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import L from 'leaflet'
import 'leaflet.heat';
import { fishingZones, quickStats } from '../data/dummyData'
import { geolocationService } from '../services/geolocationService'
import type { GPSCoordinate } from '../data/dummyData'
import { weatherService } from '../services/weatherService'
import type { FishingSafetyResult } from '../services/weatherService'

interface HomePageProps {
  onZoneClick: (zoneId: string) => void
}

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

const HeatmapLayer = ({ points }: { points: [number, number, number][] }) => {
  const map = useMap();
  useEffect(() => {
    if (!map || !points.length) return;
    // Remove previous heat layer if any
    const mapWithHeatLayer = map as any;
    if (mapWithHeatLayer._heatLayer) {
      map.removeLayer(mapWithHeatLayer._heatLayer);
    }
    // Filter out invalid points
    const heatData = points
      .filter(p => typeof p[0] === 'number' && typeof p[1] === 'number' && !isNaN(p[0]) && !isNaN(p[1]))
      .map(p => [p[0], p[1], p[2] || 1]);
    
    // Create heat layer
    const heatLayer = (L as any).heatLayer(heatData, {
      radius: 25,
      blur: 15,
      maxZoom: 12,
      minOpacity: 0.3,
      gradient: {0.2: '#fbbf24', 0.4: '#f59e42', 0.6: '#f87171', 0.8: '#ef4444', 1.0: '#b91c1c'} // yellow to orange to red
    });
    
    mapWithHeatLayer._heatLayer = heatLayer;
    heatLayer.addTo(map);
    
    return () => {
      if (mapWithHeatLayer._heatLayer) {
        map.removeLayer(mapWithHeatLayer._heatLayer);
        mapWithHeatLayer._heatLayer = null;
      }
    };
  }, [map, points]);
  return null;
};

const MapClickRedirect = () => {
  const navigate = useNavigate();
  useMapEvent('click', () => {
    navigate('/map');
  });
  return null;
};

const HomePage = ({ onZoneClick }: HomePageProps) => {
  const [currentLocation, setCurrentLocation] = useState<GPSCoordinate | null>(null)
  const [locationPermission, setLocationPermission] = useState<'granted' | 'denied' | 'pending'>('pending')
  const [clusters, setClusters] = useState<any[]>([])
  const [fishingSafety, setFishingSafety] = useState<FishingSafetyResult | null>(null)
  const [isFetchingWeather, setIsFetchingWeather] = useState<boolean>(false)

  useEffect(() => {
    const initializeLocation = async () => {
      try {
        const hasPermission = await geolocationService.requestPermission()
        if (hasPermission) {
          setLocationPermission('granted')
          const position = await geolocationService.getCurrentPosition()
          setCurrentLocation(position)
          
          // Start watching location for live updates
          geolocationService.startWatching((position) => {
            setCurrentLocation(position)
          })
        } else {
          setLocationPermission('denied')
        }
      } catch (error) {
        console.error('Error initializing location:', error)
        setLocationPermission('denied')
      }
    }

    initializeLocation()

    return () => {
      geolocationService.stopWatching()
    }
  }, [])

  useEffect(() => {
    // Load cluster data from the same source as FullMapPage
    fetch('/clusters100.json')
      .then(res => res.json())
      .then(data => setClusters(data))
      .catch(() => setClusters([]))
  }, [])

  useEffect(() => {
    const fetchWeather = async () => {
      if (!currentLocation) return
      try {
        setIsFetchingWeather(true)
        const result = await weatherService.getFishingSafety(currentLocation.latitude, currentLocation.longitude)
        setFishingSafety(result)
      } catch (err) {
        setFishingSafety(null)
      } finally {
        setIsFetchingWeather(false)
      }
    }
    fetchWeather()
  }, [currentLocation])

  const formatCoordinate = (coord: number, type: 'lat' | 'lng') => {
    const direction = type === 'lat' ? (coord >= 0 ? 'N' : 'S') : (coord >= 0 ? 'E' : 'W')
    return `${Math.abs(coord).toFixed(4)}°${direction}`
  }

  const getLocationStatus = () => {
    if (locationPermission === 'pending') return 'Requesting...'
    if (locationPermission === 'denied') return 'Access Denied'
    if (!currentLocation) return 'Searching...'
    return 'Active'
  }

  const getLocationStatusColor = () => {
    if (locationPermission === 'pending') return 'text-yellow-600'
    if (locationPermission === 'denied') return 'text-red-600'
    if (!currentLocation) return 'text-yellow-600'
    return 'text-green-600'
  }

  const getProbabilityColor = (probability: string) => {
    switch (probability) {
      case 'high': return '#3b82f6' // blue
      case 'medium': return '#f59e0b' // amber
      case 'low': return '#ef4444' // red
      default: return '#6b7280' // gray
    }
  }

  const getCircleOptions = (probability: string) => ({
    color: getProbabilityColor(probability),
    fillColor: getProbabilityColor(probability),
    fillOpacity: 0.3,
    weight: 2
  })



  return (
    <div className="p-4 space-y-4">
      {/* Quick Info Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <div className="flex items-center space-x-2">
            <MapPin className="text-ocean-600" size={20} />
            <div>
              <p className="text-sm text-gray-600">PFZ Zones Today</p>
              <p className="text-xl font-bold text-ocean-700">{quickStats.todayZones}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Activity className={
                fishingSafety?.status === 'Safe' ? 'text-green-600' : fishingSafety?.status === 'Unsafe' ? 'text-red-600' : 'text-amber-600'
              } size={20} />
              <div>
                <p className="text-sm text-gray-600">Weather</p>
                <p className={
                  `text-sm font-semibold ${
                    fishingSafety?.status === 'Safe' ? 'text-green-700' : fishingSafety?.status === 'Unsafe' ? 'text-red-700' : 'text-amber-700'
                  }`
                }>
                  {isFetchingWeather && 'Checking...'}
                  {!isFetchingWeather && fishingSafety?.status || quickStats.weatherStatus}
                </p>
              </div>
            </div>
            <div className="text-right text-xs text-gray-600">
              {fishingSafety?.conditions && (
                <div>
                  {fishingSafety.conditions.windSpeedMetersPerSecond != null && (
                    <div>Wind: {fishingSafety.conditions.windSpeedMetersPerSecond.toFixed(1)} m/s</div>
                  )}
                  {fishingSafety.conditions.waveHeightMeters != null && (
                    <div>Waves: {fishingSafety.conditions.waveHeightMeters.toFixed(1)} m</div>
                  )}
                </div>
              )}
            </div>
          </div>
          {!isFetchingWeather && fishingSafety?.reasons?.length ? (
            <ul className="mt-2 list-disc list-inside text-xs text-gray-600">
              {fishingSafety.reasons.slice(0,2).map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          ) : null}
        </div>

        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <div className="flex items-center space-x-2">
            <Thermometer className="text-blue-600" size={20} />
            <div>
              <p className="text-sm text-gray-600">Boundary</p>
              <p className="text-sm font-semibold text-blue-700">{quickStats.boundaryStatus}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <div className="flex items-center space-x-2">
            <Fish className="text-orange-600" size={20} />
            <div>
              <p className="text-sm text-gray-600">Active Alerts</p>
              <p className="text-xl font-bold text-orange-700">{quickStats.activeAlerts}</p>
            </div>
          </div>
        </div>
      </div>

      {/* GPS Location Section */}
      <div className="bg-white rounded-lg p-4 shadow-sm border">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Satellite className="text-blue-600" size={20} />
            <h2 className="text-lg font-semibold text-gray-800">GPS Location</h2>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${
              locationPermission === 'granted' && currentLocation ? 'bg-green-500' : 
              locationPermission === 'denied' ? 'bg-red-500' : 'bg-yellow-500'
            }`}></div>
            <span className={`text-sm font-medium ${getLocationStatusColor()}`}>
              {getLocationStatus()}
            </span>
          </div>
        </div>

        {currentLocation ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Latitude:</span>
                <span className="text-sm font-mono font-medium">
                  {formatCoordinate(currentLocation.latitude, 'lat')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Longitude:</span>
                <span className="text-sm font-mono font-medium">
                  {formatCoordinate(currentLocation.longitude, 'lng')}
                </span>
              </div>
            </div>
            <div className="space-y-2">
              {currentLocation.accuracy && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Accuracy:</span>
                  <span className="text-sm font-medium">±{Math.round(currentLocation.accuracy)}m</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Last Update:</span>
                <span className="text-sm font-medium">
                  {new Date(currentLocation.timestamp).toLocaleTimeString()}
                </span>
              </div>
            </div>
          </div>
        ) : locationPermission === 'denied' ? (
          <div className="text-center py-4">
            <Navigation className="text-gray-400 mx-auto mb-2" size={32} />
            <p className="text-gray-600 text-sm">
              Location access is required for geofencing features.
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
            >
              Enable Location
            </button>
          </div>
        ) : (
          <div className="text-center py-4">
            <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-2"></div>
            <p className="text-gray-600 text-sm">Getting your location...</p>
          </div>
        )}
      </div>

      {/* Map Section */}
      <div className="bg-white rounded-lg p-4 shadow-sm border">
        <h2 className="text-lg font-semibold mb-3 text-gray-800">Fishing Zone Map</h2>
        <div className="h-64 rounded-lg overflow-hidden border">
          <MapContainer
            center={[18.9000, 72.2000]}
            zoom={10}
            style={{ height: '100%', width: '100%' }}
          >
            <MapClickRedirect />
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            
            {/* Heatmap Layer */}
            <HeatmapLayer points={clusters.map(c => [c.lat, c.lon, (c.count || 0) / 1000])} />
            
            {/* Current Location Marker */}
            {currentLocation && (
              <Marker 
                position={[currentLocation.latitude, currentLocation.longitude]}
                icon={L.divIcon({
                  className: 'current-location-marker',
                  html: `
                    <div style="
                      width: 20px; 
                      height: 20px; 
                      background: #3b82f6; 
                      border: 3px solid white; 
                      border-radius: 50%; 
                      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
                    "></div>
                  `,
                  iconSize: [20, 20],
                  iconAnchor: [10, 10]
                })}
              >
                <Popup>
                  <div className="p-2">
                    <h3 className="font-semibold text-blue-800">Your Location</h3>
                    <div className="space-y-1 text-sm">
                      <p><strong>Latitude:</strong> {formatCoordinate(currentLocation.latitude, 'lat')}</p>
                      <p><strong>Longitude:</strong> {formatCoordinate(currentLocation.longitude, 'lng')}</p>
                      {currentLocation.accuracy && (
                        <p><strong>Accuracy:</strong> ±{Math.round(currentLocation.accuracy)}m</p>
                      )}
                      <p><strong>Updated:</strong> {new Date(currentLocation.timestamp).toLocaleTimeString()}</p>
                    </div>
                  </div>
                </Popup>
              </Marker>
            )}
            
            {/* Fishing Zone Markers and Circles */}
            {fishingZones.map((zone) => (
              <div key={zone.id}>
                <Marker position={zone.coordinates}>
                  <Popup>
                    <div className="p-2">
                      <h3 className="font-semibold text-gray-800">{zone.name}</h3>
                      <div className="space-y-1 text-sm">
                        <p><strong>Probability:</strong> {zone.probability}</p>
                        <p><strong>Temperature:</strong> {zone.temperature}°C</p>
                        <p><strong>Depth:</strong> {zone.depth}m</p>
                        <p><strong>Fish:</strong> {zone.fishType.join(', ')}</p>
                      </div>
                    </div>
                  </Popup>
                </Marker>
                
                <Circle
                  center={zone.coordinates}
                  radius={2000} // 2km radius
                  pathOptions={getCircleOptions(zone.probability)}
                />
              </div>
            ))}

            {/* Dynamic Cluster Circles */}
            {clusters.map((cluster, idx) => (
              <Circle
                key={`cluster-${idx}`}
                center={[cluster.lat, cluster.lon]}
                radius={10000}
                pathOptions={{ color: '#0ea5e9', fillColor: '#38bdf8', fillOpacity: 0.2, weight: 2 }}
              >
                <Popup>
                  <div className="p-2">
                    <h3 className="font-semibold text-gray-800">Cluster Details</h3>
                    <div className="space-y-1 text-sm">
                      <p><strong>Latitude:</strong> {cluster.lat}</p>
                      <p><strong>Longitude:</strong> {cluster.lon}</p>
                      <p><strong>Avg Depth:</strong> {cluster.avg_depth}m</p>
                      <p><strong>Count:</strong> {cluster.count}</p>
                    </div>
                  </div>
                </Popup>
              </Circle>
            ))}

            {/* Count-based Cluster Circles */}
            {clusters.map((p, idx) => (
              <Circle
                key={`count-${idx}`}
                center={[p.lat, p.lon]}
                radius={5000 + 15000 * ((p.count || 0) / 3000)}
                pathOptions={{
                  color: p.count > 2000 ? '#a21caf' : p.count > 1500 ? '#b91c1c' : '#fbbf24',
                  fillColor: p.count > 2000 ? '#a21caf' : p.count > 1500 ? '#b91c1c' : '#fbbf24',
                  fillOpacity: 0.5,
                  weight: 2
                }}
              >
                <Popup>
                  <div className="p-2">
                    <h3 className="font-semibold text-gray-800">Fish Density</h3>
                    <div className="space-y-1 text-sm">
                      <p><strong>Latitude:</strong> {p.lat}</p>
                      <p><strong>Longitude:</strong> {p.lon}</p>
                      <p><strong>Avg Depth:</strong> {p.avg_depth}m</p>
                      <p><strong>Count:</strong> {p.count}</p>
                    </div>
                  </div>
                </Popup>
              </Circle>
            ))}
          </MapContainer>
        </div>

        {/* Legend */}
        <div className="mt-3 flex items-center justify-center space-x-4 text-sm">
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span>High Probability</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 rounded-full bg-amber-500"></div>
            <span>Medium</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span>Low</span>
          </div>
        </div>
      </div>

      {/* Zone Details */}
      <div className="bg-white rounded-lg p-4 shadow-sm border">
        <h2 className="text-lg font-semibold mb-3 text-gray-800">Today's PFZ Zones</h2>
        <div className="space-y-3">
          {fishingZones.slice(0, 4).map((zone) => (
            <button
              key={zone.id}
              onClick={() => onZoneClick(zone.id)}
              className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border-2 border-transparent hover:border-ocean-200 active:border-ocean-300"
            >
              <div className="text-left">
                <h3 className="font-medium text-gray-800">{zone.name}</h3>
                <p className="text-sm text-gray-600">{zone.fishType.join(', ')}</p>
                <p className="text-xs text-ocean-600 mt-1">📍 Tap to navigate</p>
              </div>
              <div className="text-right">
                <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                  zone.probability === 'high' ? 'bg-blue-100 text-blue-800' :
                  zone.probability === 'medium' ? 'bg-amber-100 text-amber-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {zone.probability}
                </span>
                <p className="text-sm text-gray-600 mt-1">{zone.temperature}°C</p>
                <p className="text-xs text-gray-500">{zone.depth}m deep</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Cluster Zones Section */}
      <div className="bg-white rounded-lg p-4 shadow-sm border">
        <h2 className="text-lg font-semibold mb-3 text-gray-800">Cluster Zones</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {clusters.slice(0, 6).map((cluster, idx) => (
            <div key={idx} className="bg-ocean-50 rounded-lg p-3 border border-ocean-100">
              <h3 className="font-bold text-ocean-700 mb-1">Cluster {idx + 1}</h3>
              <p className="text-sm text-gray-700">Lat: <span className="font-mono">{cluster.lat?.toFixed(4)}</span></p>
              <p className="text-sm text-gray-700">Lon: <span className="font-mono">{cluster.lon?.toFixed(4)}</span></p>
              <p className="text-sm text-gray-700">Depth: <span className="font-semibold">{cluster.avg_depth}m</span></p>
              <p className="text-sm text-orange-700">Count: <span className="font-semibold">{cluster.count}</span></p>
            </div>
          ))}
        </div>
        {clusters.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <div className="animate-spin w-8 h-8 border-2 border-ocean-600 border-t-transparent rounded-full mx-auto mb-2"></div>
            <p>Loading cluster data...</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default HomePage
