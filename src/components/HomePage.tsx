import { MapPin, Thermometer, Activity, Fish } from 'lucide-react'
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet'
import L from 'leaflet'
import { fishingZones, quickStats } from '../data/dummyData'

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

const HomePage = ({ onZoneClick }: HomePageProps) => {
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
          <div className="flex items-center space-x-2">
            <Activity className="text-green-600" size={20} />
            <div>
              <p className="text-sm text-gray-600">Weather</p>
              <p className="text-sm font-semibold text-green-700">{quickStats.weatherStatus}</p>
            </div>
          </div>
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

      {/* Map Section */}
      <div className="bg-white rounded-lg p-4 shadow-sm border">
        <h2 className="text-lg font-semibold mb-3 text-gray-800">Fishing Zone Map</h2>
        <div className="h-64 rounded-lg overflow-hidden border">
          <MapContainer
            center={[18.9000, 72.2000]} // Center on Arabian Sea near Mumbai
            zoom={10}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            
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
    </div>
  )
}

export default HomePage
