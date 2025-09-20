// Custom hook to get window width
import { useLayoutEffect } from 'react'
function useWindowWidth() {
  const [width, setWidth] = useState(window.innerWidth)
  useLayoutEffect(() => {
    function updateWidth() {
      setWidth(window.innerWidth)
    }
    window.addEventListener('resize', updateWidth)
    return () => window.removeEventListener('resize', updateWidth)
  }, [])
  return width
}
import { MapPin, Thermometer, Activity, Fish, Navigation, Satellite } from 'lucide-react'
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap, useMapEvent } from 'react-leaflet'
import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import L from 'leaflet'
import 'leaflet.heat';
import { quickStats } from '../data/dummyData'
import type { GPSCoordinate } from '../data/dummyData'
import { weatherService } from '../services/weatherService'
import boatIconUrl from '../assets/boat.png';
import JourneyTracker from './JourneyTracker'
import { default as FishSpeciesPrediction } from './FishSpeciesPrediction'
import EEZBoundary from './EEZBoundary'

interface HomePageProps {
  currentLocation?: GPSCoordinate | null
  locationPermission?: 'granted' | 'denied' | 'pending'
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

const FitMapToUserAndClusters = ({ userLocation, clusters }: { userLocation: GPSCoordinate | null, clusters: any[] }) => {
  const map = useMap();
  useEffect(() => {
    if (!map) return;
    let bounds: [number, number][] = [];
    if (userLocation) bounds.push([userLocation.latitude, userLocation.longitude]);
    clusters.forEach(c => {
      if (typeof c.lat === 'number' && typeof c.lon === 'number') {
        bounds.push([c.lat, c.lon]);
      }
    });
    if (bounds.length > 0) {
      map.fitBounds(L.latLngBounds(bounds), { padding: [40, 40], maxZoom: 13 });
    }
  }, [map, userLocation, clusters]);
  return null;
};

const MapClickRedirect = ({ userLocation, clusters }: { userLocation: GPSCoordinate | null, clusters: any[] }) => {
  const navigate = useNavigate();
  useMapEvent('click', () => {
    // Find best center: user location, else nearest cluster, else default
    let center = [18.9000, 72.2000];
    if (userLocation) {
      center = [userLocation.latitude, userLocation.longitude];
    } else if (clusters.length > 0) {
      center = [clusters[0].lat, clusters[0].lon];
    }
    navigate(`/map?center=${center[0]},${center[1]}`);
  });
  return null;
};

const HomePage = ({ currentLocation, locationPermission }: HomePageProps) => {
  const navigate = useNavigate()
  const [clusters, setClusters] = useState<any[]>([])
  const [fishingSafety, setFishingSafety] = useState<any>(null)
  const [isFetchingWeather, setIsFetchingWeather] = useState<boolean>(false)
    const [persistedStatus, setPersistedStatus] = useState<string | null>(null)

  // Enhanced color functions for weather conditions
  const getWindColor = (windSpeed?: number) => {
    if (!windSpeed) return 'text-gray-500'
    if (windSpeed <= 6) return 'text-green-600'
    if (windSpeed <= 10) return 'text-yellow-500'
    return 'text-red-500'
  }

  const getWaveColor = (waveHeight?: number) => {
    if (!waveHeight) return 'text-gray-500'  
    if (waveHeight <= 1.0) return 'text-blue-600'
    if (waveHeight <= 1.8) return 'text-yellow-500'
    return 'text-red-500'
  }

  const getWeatherIcon = () => {
    const status = fishingSafety?.status
    if (status === 'Safe') return '✅'
    if (status === 'Unsafe') return '⚠️'
    return '⚡'
  }

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
          // Persist status in localStorage
          if (result?.status === 'Safe' || result?.status === 'Unsafe') {
            localStorage.setItem('lastFishingStatus', result.status)
            setPersistedStatus(result.status)
          }
      } catch (err) {
        setFishingSafety(null)
      } finally {
        setIsFetchingWeather(false)
      }
    }
    fetchWeather()
      // On mount, load persisted status
      const lastStatus = localStorage.getItem('lastFishingStatus')
      if (lastStatus) setPersistedStatus(lastStatus)
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

  // Create a custom boat icon for the user's location
  const boatIcon = new L.Icon({
    iconUrl: boatIconUrl,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
    className: 'boat-marker',
  });

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

        <button 
          onClick={() => navigate('/weather')}
          className="bg-white rounded-lg p-4 shadow-sm border relative min-h-[120px] w-full text-left hover:shadow-md hover:bg-gray-50 transition-all duration-200 transform hover:scale-[1.02] cursor-pointer overflow-hidden max-w-full sm:max-w-none"
        >
          {/* Weather Status - Left Side Center */}
          <div className="absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 w-[70vw] sm:w-auto">
            {(() => {
              const width = useWindowWidth();
              if (width < 400) {
                return (
                  <div className="flex items-center space-x-2 min-w-0 w-full">
                    <Activity className={
                      fishingSafety?.status === 'Safe' ? 'text-green-600' : fishingSafety?.status === 'Unsafe' ? 'text-red-600' : 'text-amber-600'
                    } size={20} />
                    <p className="text-xs font-semibold truncate" style={{maxWidth: '50vw'}}>
                      {isFetchingWeather && 'Checking...'}
                      {!isFetchingWeather && fishingSafety?.status === 'Safe' && 'Safe'}
                      {!isFetchingWeather && fishingSafety?.status === 'Unsafe' && 'Unsafe'}
                      {!isFetchingWeather && !['Safe','Unsafe'].includes(fishingSafety?.status || '') && quickStats.weatherStatus}
                    </p>
                  </div>
                )
              }
              return (
                <div className="flex items-center space-x-2 min-w-0 w-full">
                  <Activity className={
                    fishingSafety?.status === 'Safe' ? 'text-green-600' : fishingSafety?.status === 'Unsafe' ? 'text-red-600' : 'text-amber-600'
                  } size={20} />
                  <div className="min-w-0 w-full">
                    {/* Only show status on very small screens */}
                    <p className="block sm:hidden text-xs font-semibold truncate" style={{maxWidth: '50vw'}}>
                      {isFetchingWeather && 'Checking...'}
                      {!isFetchingWeather && fishingSafety?.status === 'Safe' && 'Safe to fish'}
                      {!isFetchingWeather && fishingSafety?.status === 'Unsafe' && 'Unsafe to fish'}
                      {!isFetchingWeather && !['Safe','Unsafe'].includes(fishingSafety?.status || '') && quickStats.weatherStatus}
                    </p>
                    {/* Full info for larger screens */}
                    <div className="hidden sm:flex flex-col">
                      <p className="text-sm text-gray-600 truncate">Weather Status</p>
                      <div className="flex items-center space-x-2 min-w-0">
                        <span className="text-lg">{getWeatherIcon()}</span>
                        <p className={
                          `text-sm font-semibold truncate ${
                            fishingSafety?.status === 'Safe' ? 'text-green-700' : fishingSafety?.status === 'Unsafe' ? 'text-red-700' : 'text-amber-700'
                          }`
                        }>
                          {isFetchingWeather && 'Checking...'}
                          {!isFetchingWeather && fishingSafety?.status || quickStats.weatherStatus}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })()}
          </div>
          
          {/* Click indicator */}
          <div className="absolute top-2 right-2 text-gray-400 text-xs">
            Tap for details →
          </div>

          {/* Wind Status - Top Right Corner */}
          {fishingSafety?.conditions?.windSpeedMetersPerSecond != null && (
            <div className="absolute top-4 right-4">
              <div className="flex items-center space-x-2">
                <span className="text-xl">💨</span>
                <div className="text-right">
                  <p className={`text-lg font-bold ${getWindColor(fishingSafety.conditions.windSpeedMetersPerSecond)}`}>
                    {fishingSafety.conditions.windSpeedMetersPerSecond.toFixed(1)} m/s
                  </p>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">WIND</p>
                </div>
              </div>
            </div>
          )}

          {/* Wave Status - Bottom Right Corner */}
          {fishingSafety?.conditions?.waveHeightMeters != null && (
            <div className="absolute bottom-4 right-4">
              <div className="flex items-center space-x-2">
                <span className="text-xl">🌊</span>
                <div className="text-right">
                  <p className={`text-lg font-bold ${getWaveColor(fishingSafety.conditions.waveHeightMeters)}`}>
                    {fishingSafety.conditions.waveHeightMeters.toFixed(1)} m
                  </p>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">WAVES</p>
                </div>
              </div>
            </div>
          )}

          {/* Additional Weather Info - Bottom Left */}
          {!isFetchingWeather && fishingSafety?.reasons?.length ? (
            <div className="absolute bottom-4 left-4 max-w-[200px]">
              <ul className="space-y-1 text-xs text-gray-600">
                {fishingSafety.reasons.slice(0,1).map((r: any, i: number) => (
                  <li key={i} className="flex items-center space-x-2">
                    <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </button>

        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <div className="flex items-center space-x-2">
            <Thermometer className="text-blue-600" size={20} />
            <div>
               <p className="text-sm text-gray-600">Boundary Status</p>
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

      {/* Fish Species Prediction Section */}
      <FishSpeciesPrediction />

      {/* Map Section */}
      <div className="bg-white rounded-lg p-4 shadow-sm border">
         <h2 className="text-lg font-semibold mb-3 text-gray-800">Fishing Zone Map</h2>
        <div className="h-64 rounded-lg overflow-hidden border">
          <MapContainer
            center={currentLocation ? [currentLocation.latitude, currentLocation.longitude] : clusters.length > 0 ? [clusters[0].lat, clusters[0].lon] : [18.9000, 72.2000]}
            zoom={13}
            style={{ height: '100%', width: '100%' }}
            preferCanvas
          >
            <FitMapToUserAndClusters userLocation={currentLocation || null} clusters={clusters} />
            <MapClickRedirect userLocation={currentLocation || null} clusters={clusters} />
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            
            {/* EEZ Boundary Layer */}
            <EEZBoundary />
            
            {/* Heatmap Layer */}
            <HeatmapLayer points={clusters.map(c => [c.lat, c.lon, (c.count || 0) / 1000])} />
            
            {/* Current Location Marker */}
            {currentLocation && (
              <Marker 
                position={[currentLocation.latitude ?? 0, currentLocation.longitude ?? 0]}
                icon={boatIcon}
              >
                <Popup>
                  <div className="p-2">
                    <h3 className="font-semibold text-blue-800">Your Location</h3>
                    <div className="space-y-1 text-sm">
                      <p><strong>Latitude:</strong> {currentLocation?.latitude ? formatCoordinate(currentLocation.latitude, 'lat') : 'N/A'}</p>
                      <p><strong>Longitude:</strong> {currentLocation?.longitude ? formatCoordinate(currentLocation.longitude, 'lng') : 'N/A'}</p>
                      {currentLocation?.accuracy && (
                        <p><strong>Accuracy:</strong> ±{Math.round(currentLocation.accuracy ?? 0)}m</p>
                      )}
                      <p><strong>Updated:</strong> {currentLocation?.timestamp ? new Date(currentLocation.timestamp).toLocaleTimeString() : 'N/A'}</p>
                    </div>
                  </div>
                </Popup>
              </Marker>
            )}
            
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
              <span>High Density</span>
            </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 rounded-full bg-amber-500"></div>
              <span>Medium Density</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span>Low Density</span>
          </div>
        </div>
      </div>

      {/* Journey Tracker Section */}
      <JourneyTracker currentLocation={currentLocation} />
    </div>
  )
}

export default HomePage
