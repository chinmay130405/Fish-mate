import { MapPin, Thermometer, Activity, Fish } from 'lucide-react'
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet.heat';
import { fishingZones, quickStats } from '../data/dummyData'
import { useEffect, useState } from 'react'

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

const HeatmapLayer = ({ points }: { points: any[] }) => {
  const map = useMap();
  useEffect(() => {
    if (!map || !points.length) return;
    // Remove previous heat layer if any
    if (map._heatLayer) {
      map.removeLayer(map._heatLayer);
    }
    // Filter out invalid points
    const heatData = points
      .filter(p => typeof p[0] === 'number' && typeof p[1] === 'number' && !isNaN(p[0]) && !isNaN(p[1]))
      .map(p => [p[0], p[1], p[2] || 1]);
    // @ts-ignore
    map._heatLayer = window.L.heatLayer(heatData, {
      radius: 25,
      blur: 15,
      maxZoom: 12,
      minOpacity: 0.3,
      gradient: {0.2: '#fbbf24', 0.4: '#f59e42', 0.6: '#f87171', 0.8: '#ef4444', 1.0: '#b91c1c'} // yellow to orange to red
    }).addTo(map);
    return () => {
      if (map._heatLayer) map.removeLayer(map._heatLayer);
    };
  }, [map, points]);
  return null;
};

const HomePage = ({ onZoneClick }: HomePageProps) => {
  const [clusters, setClusters] = useState<any[]>([])

  useEffect(() => {
    fetch('/clusters100.json')
      .then(res => res.json())
      .then(data => setClusters(data))
      .catch(() => setClusters([]))
  }, [])

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
            center={[18.9000, 72.2000]}
            zoom={10}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            {/* Heatmap Layer for clusters */}
            <HeatmapLayer points={clusters} />

            {/* Cluster Regions (as circles) */}
            {clusters.map(cluster => (
              <Circle
                key={cluster.cluster}
                center={[cluster.lat, cluster.lon]}
                radius={10000} // 10km radius for region visualization
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

            {/* Remove Fishing Zone Markers and Circles (default 5 points) */}
            {/* Removed as per user request */}

            {/* Cluster Points as colored circles by count */}
            {clusters.map((p, idx) => (
              <Circle
                key={idx}
                center={[p.lat, p.lon]}
                radius={5000 + 15000 * ((p.count || 0) / 3000)} // radius scales with count
                pathOptions={{
                  color: p.count > 2000 ? '#a21caf' : p.count > 1500 ? '#b91c1c' : '#fbbf24',
                  fillColor: p.count > 2000 ? '#a21caf' : p.count > 1500 ? '#b91c1c' : '#fbbf24',
                  fillOpacity: 0.5,
                  weight: 2
                }}
              >
                <Popup>
                  <div className="p-2">
                    <h3 className="font-semibold text-gray-800">Cluster Details</h3>
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
          {clusters.map((p, idx) => (
            <div key={idx} className="bg-ocean-50 rounded-lg p-3 border border-ocean-100">
              <h3 className="font-bold text-ocean-700 mb-1">Point {idx + 1}</h3>
              <p className="text-sm text-gray-700">Lat: <span className="font-mono">{typeof p[0] === 'number' ? p[0].toFixed(4) : p[0]}</span></p>
              <p className="text-sm text-gray-700">Lon: <span className="font-mono">{typeof p[1] === 'number' ? p[1].toFixed(4) : p[1]}</span></p>
              <p className="text-sm text-orange-700">Weight: <span className="font-semibold">{typeof p[2] === 'number' ? p[2].toFixed(2) : p[2]}</span></p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default HomePage
