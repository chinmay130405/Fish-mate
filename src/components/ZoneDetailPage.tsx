import { useState, useEffect } from 'react'
import { ArrowLeft, Navigation, MapPin, Compass, Clock, Fish } from 'lucide-react'
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet'
import L from 'leaflet'
import { fishingZones } from '../data/dummyData'

interface ZoneDetailPageProps {
  zoneId: string
  onBack: () => void
}

const ZoneDetailPage = ({ zoneId, onBack }: ZoneDetailPageProps) => {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null)
  const [isNavigating, setIsNavigating] = useState(false)
  const [eta, setEta] = useState<number | null>(null)
  
  const zone = fishingZones.find(z => z.id === zoneId)
  
  useEffect(() => {
    // Simulate getting user's GPS location
    // In real app, this would use navigator.geolocation
    setTimeout(() => {
      // Simulated current location (Mumbai coast)
      setUserLocation([19.0760, 72.8777])
    }, 1000)
  }, [])

  useEffect(() => {
    if (userLocation && zone) {
      // Calculate ETA (simplified calculation)
      const distance = calculateDistance(userLocation, zone.coordinates)
      const speedKnots = 8 // Average fishing boat speed
      const timeHours = distance / speedKnots
      setEta(timeHours * 60) // Convert to minutes
    }
  }, [userLocation, zone])

  const calculateDistance = (point1: [number, number], point2: [number, number]) => {
    // Simplified distance calculation in nautical miles
    const R = 3440.065 // Earth's radius in nautical miles
    const dLat = (point2[0] - point1[0]) * Math.PI / 180
    const dLon = (point2[1] - point1[1]) * Math.PI / 180
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(point1[0] * Math.PI / 180) * Math.cos(point2[0] * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return R * c
  }

  const startNavigation = () => {
    setIsNavigating(true)
    // In a real app, this would:
    // 1. Start GPS tracking
    // 2. Provide turn-by-turn directions
    // 3. Update route in real-time
    alert(`Navigation Started!\n\nDestination: ${zone?.name}\nCoordinates: ${zone?.coordinates[0]}°N, ${zone?.coordinates[1]}°E\n\nGPS tracking active.\nFollow the blue route line on the map.`)
  }

  if (!zone) {
    return (
      <div className="p-4">
        <button onClick={onBack} className="flex items-center space-x-2 text-ocean-600 mb-4">
          <ArrowLeft size={20} />
          <span>Back</span>
        </button>
        <p>Zone not found</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-white border-b p-4">
        <div className="flex items-center justify-between">
          <button 
            onClick={onBack} 
            className="flex items-center space-x-2 text-ocean-600 hover:text-ocean-700"
          >
            <ArrowLeft size={20} />
            <span>Back</span>
          </button>
          <h1 className="text-lg font-bold text-gray-800">{zone.name}</h1>
          <div className="w-12"></div> {/* Spacer for centering */}
        </div>
      </div>

      {/* Zone Info Cards */}
      <div className="p-4 bg-gray-50">
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-white rounded-lg p-3 text-center">
            <Fish className="mx-auto text-ocean-600 mb-1" size={20} />
            <p className="text-xs text-gray-600">Probability</p>
            <p className={`font-bold ${
              zone.probability === 'high' ? 'text-blue-600' :
              zone.probability === 'medium' ? 'text-amber-600' :
              'text-red-600'
            }`}>
              {zone.probability.toUpperCase()}
            </p>
          </div>
          
          <div className="bg-white rounded-lg p-3 text-center">
            <Compass className="mx-auto text-gray-600 mb-1" size={20} />
            <p className="text-xs text-gray-600">Distance</p>
            <p className="font-bold text-gray-800">
              {userLocation ? calculateDistance(userLocation, zone.coordinates).toFixed(1) : '...'} nm
            </p>
          </div>
          
          <div className="bg-white rounded-lg p-3 text-center">
            <Clock className="mx-auto text-green-600 mb-1" size={20} />
            <p className="text-xs text-gray-600">ETA</p>
            <p className="font-bold text-green-600">
              {eta ? `${Math.round(eta)} min` : '...'}
            </p>
          </div>
          
          <div className="bg-white rounded-lg p-3 text-center">
            <MapPin className="mx-auto text-blue-600 mb-1" size={20} />
            <p className="text-xs text-gray-600">Depth</p>
            <p className="font-bold text-blue-600">{zone.depth}m</p>
          </div>
        </div>

        {/* Fish Types */}
        <div className="bg-white rounded-lg p-3 mb-4">
          <h3 className="font-semibold text-gray-800 mb-2">Expected Fish</h3>
          <div className="flex flex-wrap gap-2">
            {zone.fishType.map((fish, index) => (
              <span 
                key={index}
                className="bg-ocean-100 text-ocean-800 px-2 py-1 rounded-full text-xs font-medium"
              >
                {fish}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="flex-1 relative">
        <div className="absolute inset-0">
          <MapContainer
            center={zone.coordinates}
            zoom={12}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            
            {/* Target Zone */}
            <Marker position={zone.coordinates}>
              <Popup>
                <div className="text-center">
                  <h3 className="font-bold">{zone.name}</h3>
                  <p>Target Fishing Zone</p>
                  <p className="text-sm text-gray-600">
                    {zone.coordinates[0].toFixed(4)}°N, {zone.coordinates[1].toFixed(4)}°E
                  </p>
                </div>
              </Popup>
            </Marker>

            {/* User Location */}
            {userLocation && (
              <Marker 
                position={userLocation}
                icon={L.icon({
                  iconUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iOCIgZmlsbD0iIzEwYjk4MSIgc3Ryb2tlPSIjZmZmZmZmIiBzdHJva2Utd2lkdGg9IjIiLz4KPGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iMyIgZmlsbD0iI2ZmZmZmZiIvPgo8L3N2Zz4K',
                  iconSize: [24, 24],
                  iconAnchor: [12, 12]
                })}
              >
                <Popup>
                  <div className="text-center">
                    <h3 className="font-bold text-green-600">Your Location</h3>
                    <p className="text-sm">Current Position</p>
                  </div>
                </Popup>
              </Marker>
            )}

            {/* Route Line */}
            {userLocation && isNavigating && (
              <Polyline 
                positions={[userLocation, zone.coordinates]} 
                color="#3b82f6" 
                weight={3}
                dashArray="10, 10"
              />
            )}
          </MapContainer>
        </div>

        {/* Navigation Status */}
        {isNavigating && (
          <div className="absolute top-4 left-4 right-4 bg-blue-600 text-white rounded-lg p-3 shadow-lg">
            <div className="flex items-center space-x-2">
              <Navigation size={20} className="animate-pulse" />
              <div className="flex-1">
                <p className="font-semibold">Navigating to {zone.name}</p>
                <p className="text-sm text-blue-100">
                  {eta ? `${Math.round(eta)} minutes remaining` : 'Calculating route...'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Button */}
      <div className="p-4 bg-white border-t">
        <button
          onClick={startNavigation}
          disabled={!userLocation}
          className={`w-full py-3 rounded-lg font-semibold flex items-center justify-center space-x-2 ${
            isNavigating 
              ? 'bg-green-600 text-white' 
              : userLocation 
                ? 'bg-ocean-600 text-white hover:bg-ocean-700' 
                : 'bg-gray-300 text-gray-500'
          }`}
        >
          <Navigation size={20} />
          <span>
            {isNavigating ? 'Navigation Active' : userLocation ? 'Start Navigation' : 'Getting GPS...'}
          </span>
        </button>
        
        {userLocation && (
          <p className="text-center text-sm text-gray-600 mt-2">
            Current location: {userLocation[0].toFixed(4)}°N, {userLocation[1].toFixed(4)}°E
          </p>
        )}
      </div>
    </div>
  )
}

export default ZoneDetailPage
