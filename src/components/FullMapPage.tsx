import { MapContainer, TileLayer, Circle, Popup, useMap, Marker } from 'react-leaflet';
import 'leaflet.heat';
import { useEffect, useState } from 'react';
import L from 'leaflet';
import boatIconUrl from '../assets/boat.png';
import { useNavigate, useLocation } from 'react-router-dom';
import EEZBoundary from './EEZBoundary';

const HeatmapLayer = ({ points }: { points: [number, number, number][] }) => {
  const map = useMap();
  useEffect(() => {
    if (!map || !points.length) return;
    const mapWithHeatLayer = map as any;
    if (mapWithHeatLayer._heatLayer) {
      map.removeLayer(mapWithHeatLayer._heatLayer);
    }
    const heatData = points
      .filter(p => typeof p[0] === 'number' && typeof p[1] === 'number' && !isNaN(p[0]) && !isNaN(p[1]))
      .map(p => [p[0], p[1], p[2] || 1]);
    
    const L = (window as any).L;
    const heatLayer = L.heatLayer(heatData, {
      radius: 25,
      blur: 15,
      maxZoom: 12,
      minOpacity: 0.3,
      gradient: {0.2: '#fbbf24', 0.4: '#f59e42', 0.6: '#f87171', 0.8: '#ef4444', 1.0: '#b91c1c'}
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

const FitBounds = ({ points }: { points: any[] }) => {
  const map = useMap();
  useEffect(() => {
    if (!points.length) return;
    const lats = points.map(p => p.latitude);
    const lons = points.map(p => p.longitude);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLon = Math.min(...lons);
    const maxLon = Math.max(...lons);
    map.fitBounds([[minLat, minLon], [maxLat, maxLon]]);
  }, [points, map]);
  return null;
};

const boatIcon = new L.Icon({
  iconUrl: boatIconUrl,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16],
  className: 'boat-marker',
});

interface FullMapPageProps {
  currentLocation: { latitude: number; longitude: number; accuracy?: number; timestamp?: number } | null;
}

const FullMapPage = ({ currentLocation }: FullMapPageProps) => {
  const location = useLocation();
  const initialMode = location.state?.mode === 'today' ? 'today' : 'previous';
  const [mode, setMode] = useState<'previous' | 'today'>(initialMode);
  const [clusters, setClusters] = useState<any[]>([]);
  const [todayPoints, setTodayPoints] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (mode === 'previous') {
      fetch('/clusters100.json')
        .then(res => res.json())
        .then(data => setClusters(data))
        .catch(() => setClusters([]));
    } else {
      fetch('/output.json')
        .then(res => res.json())
        .then(data => setTodayPoints(data))
        .catch(() => setTodayPoints([]));
    }
  }, [mode]);

  // Prepare heatmap points for today (output.json)
  const todayHeatPoints = todayPoints
    .filter((p: any) => typeof p.latitude === 'number' && typeof p.longitude === 'number')
    .map((p: any) => [p.latitude, p.longitude, 1] as [number, number, number]);

  return (
    <div className="w-screen h-screen">
      <div style={{ position: 'fixed', top: 16, left: '50%', transform: 'translateX(-50%)', zIndex: 1000 }}>
        <div className="flex space-x-2 bg-white rounded-lg shadow p-2">
          <button
            className={`px-4 py-2 rounded ${mode === 'previous' ? 'bg-ocean-600 text-white' : 'bg-gray-100 text-gray-800'}`}
            onClick={() => setMode('previous')}
          >
            {'Previous Data'}
          </button>
          <button
            className={`px-4 py-2 rounded ${mode === 'today' ? 'bg-ocean-600 text-white' : 'bg-gray-100 text-gray-800'}`}
            onClick={() => setMode('today')}
          >
            {"Today's Data"}
          </button>
          <button
            className="px-4 py-2 rounded bg-green-600 text-white"
            onClick={() => navigate('/combined-map')}
          >
            {'Hybrid'}
          </button>
        </div>
      </div>
      <MapContainer
        center={currentLocation ? [currentLocation.latitude, currentLocation.longitude] : [18.9000, 72.2000]}
        zoom={7}
        style={{ height: '100vh', width: '100vw' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        {/* EEZ Boundary Layer */}
        <EEZBoundary />
        
        {/* User's Location Marker - always shown if available */}
        {currentLocation && (
          <Marker 
            position={[currentLocation.latitude, currentLocation.longitude]}
            icon={boatIcon}
          >
            <Popup>
              <div className="p-2">
                <h3 className="font-semibold text-blue-800">Your Location</h3>
                <div className="space-y-1 text-sm">
                  <p><strong>Latitude:</strong> {currentLocation.latitude.toFixed(4)}</p>
                  <p><strong>Longitude:</strong> {currentLocation.longitude.toFixed(4)}</p>
                  {currentLocation.accuracy && (
                    <p><strong>Accuracy:</strong> ±{Math.round(currentLocation.accuracy)}m</p>
                  )}
                  {currentLocation.timestamp && (
                    <p><strong>Updated:</strong> {new Date(currentLocation.timestamp).toLocaleTimeString()}</p>
                  )}
                </div>
              </div>
            </Popup>
          </Marker>
        )}
        {mode === 'previous' ? (
          <>
            <HeatmapLayer points={clusters} />
            {clusters.map((cluster, idx) => (
              <Circle
                key={idx}
                center={[cluster.lat, cluster.lon]}
                radius={10000}
                pathOptions={{ color: '#0ea5e9', fillColor: '#38bdf8', fillOpacity: 0.2, weight: 2 }}
              >
                <Popup>
                  <div className="p-2">
                    <h3 className="font-semibold text-gray-800">{'Cluster Details'}</h3>
                    <div className="space-y-1 text-sm">
                      <p><strong>{'Latitude'}:</strong> {cluster.lat}</p>
                      <p><strong>{'Longitude'}:</strong> {cluster.lon}</p>
                      <p><strong>{'Avg Depth'}:</strong> {cluster.avg_depth}m</p>
                      <p><strong>{'Count'}:</strong> {cluster.count}</p>
                    </div>
                  </div>
                </Popup>
              </Circle>
            ))}
            {clusters.map((p, idx) => (
              <Circle
                key={"count-"+idx}
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
          </>
        ) : (
          <>
            <FitBounds points={todayPoints} />
            <HeatmapLayer points={todayHeatPoints} />
            {todayPoints.slice(0, 500).map((p: any, idx: number) => (
              <Circle
                key={idx}
                center={[p.latitude, p.longitude]}
                radius={7000}
                pathOptions={{ color: '#0ea5e9', fillColor: '#38bdf8', fillOpacity: 0.3, weight: 2 }}
              >
                <Popup>
                  <div className="p-2">
                    <h3 className="font-semibold text-gray-800">{'Today\'s Data Point'}</h3>
                    <div className="space-y-1 text-sm">
                      <p><strong>{'Latitude'}:</strong> {p.latitude}</p>
                      <p><strong>{'Longitude'}:</strong> {p.longitude}</p>
                      <p><strong>{'Depth'}:</strong> {p.average_depth !== null ? p.average_depth + 'm' : 'N/A'}</p>
                    </div>
                  </div>
                </Popup>
              </Circle>
            ))}
          </>
        )}
      </MapContainer>
    </div>
  );
};

export default FullMapPage;
