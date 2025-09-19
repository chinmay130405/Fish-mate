import { MapContainer, TileLayer, Circle, Popup, Marker } from 'react-leaflet';
import 'leaflet.heat';
import { useEffect, useState, useRef } from 'react';
import L from 'leaflet';
import boatIconUrl from '../assets/boat.png';
import { useNavigate } from 'react-router-dom';

const boatIcon = new L.Icon({
  iconUrl: boatIconUrl,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16],
  className: 'boat-marker',
});

interface CombinedMapPageProps {
  currentLocation: { latitude: number; longitude: number; accuracy?: number; timestamp?: number } | null;
}

const CombinedMapPage = ({ currentLocation }: CombinedMapPageProps) => {
  const [clusters, setClusters] = useState<any[]>([]);
  const [todayPoints, setTodayPoints] = useState<any[]>([]);
  const navigate = useNavigate();
  const mapRef = useRef<any>(null);

  useEffect(() => {
    fetch('/clusters100.json')
      .then(res => res.json())
      .then(data => setClusters(data))
      .catch(() => setClusters([]));
    fetch('/output.json')
      .then(res => res.json())
      .then(data => setTodayPoints(data))
      .catch(() => setTodayPoints([]));
  }, []);

  // Fit bounds to user and all points
  const allPoints = [
    ...(currentLocation ? [[currentLocation.latitude, currentLocation.longitude]] : []),
    ...clusters.map(c => [c.lat, c.lon]),
    ...todayPoints.map(p => [p.latitude, p.longitude]),
  ];

  useEffect(() => {
    if (mapRef.current && allPoints.length > 1) {
      mapRef.current.fitBounds(allPoints as any, { padding: [40, 40], maxZoom: 13 });
    }
  }, [currentLocation, clusters, todayPoints]);

  return (
    <div className="w-screen h-screen">
      {/* Top Navigation Buttons for seamless map switching */}
      <div style={{ position: 'fixed', top: 16, left: '50%', transform: 'translateX(-50%)', zIndex: 1000 }}>
        <div className="flex space-x-2 bg-white rounded-lg shadow p-2">
          <button
            className="px-4 py-2 rounded bg-ocean-600 text-white"
            onClick={() => navigate('/full-map', { state: { mode: 'previous' } })}
          >
            Previous Data
          </button>
          <button
            className="px-4 py-2 rounded bg-ocean-600 text-white"
            onClick={() => navigate('/full-map', { state: { mode: 'today' } })}
          >
            Today's Data
          </button>
          <button
            className="px-4 py-2 rounded bg-green-600 text-white"
            onClick={() => navigate('/combined-map')}
          >
            Hybrid
          </button>
        </div>
      </div>
      <MapContainer
        ref={mapRef}
        center={currentLocation ? [currentLocation.latitude, currentLocation.longitude] : clusters.length > 0 ? [clusters[0].lat, clusters[0].lon] : [18.9, 72.2]}
        zoom={13}
        style={{ height: '100vh', width: '100vw' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {/* User's Location Marker */}
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
        {/* Previous Data: Blue Circles */}
        {clusters.map((cluster: any, idx: number) => (
          <Circle
            key={`prev-${idx}`}
            center={[cluster.lat, cluster.lon]}
            radius={10000}
            pathOptions={{ color: '#2563eb', fillColor: '#2563eb', fillOpacity: 0.25, weight: 2 }}
          >
            <Popup>
              <div className="p-2">
                <h3 className="font-semibold text-blue-800">Previous Cluster</h3>
                <div className="space-y-1 text-sm">
                  <p><strong>Latitude:</strong> {cluster.lat}</p>
                  <p><strong>Longitude:</strong> {cluster.lon}</p>
                  <p><strong>Avg Depth:</strong> {cluster.avg_depth}m</p>
                  <p><strong>Count:</strong> {cluster.count}</p>
                </div>
                <button
                  className="mt-2 px-3 py-1 bg-green-600 text-white rounded"
                  onClick={() => navigate('/', { state: { navLat: cluster.lat, navLon: cluster.lon } })}
                >
                  Start Navigation
                </button>
              </div>
            </Popup>
          </Circle>
        ))}
        {/* Today's Data: Red Circles */}
        {todayPoints.map((p: any, idx: number) => (
          <Circle
            key={`today-${idx}`}
            center={[p.latitude, p.longitude]}
            radius={10000}
            pathOptions={{ color: '#dc2626', fillColor: '#dc2626', fillOpacity: 0.25, weight: 2 }}
          >
            <Popup>
              <div className="p-2">
                <h3 className="font-semibold text-red-700">Today's Cluster</h3>
                <div className="space-y-1 text-sm">
                  <p><strong>Latitude:</strong> {p.latitude}</p>
                  <p><strong>Longitude:</strong> {p.longitude}</p>
                  <p><strong>Depth:</strong> {p.average_depth}m</p>
                  <p><strong>Count:</strong> {p.count}</p>
                </div>
                <button
                  className="mt-2 px-3 py-1 bg-green-600 text-white rounded"
                  onClick={() => navigate('/', { state: { navLat: p.latitude, navLon: p.longitude } })}
                >
                  Start Navigation
                </button>
              </div>
            </Popup>
          </Circle>
        ))}
      </MapContainer>
      {/* Color Legend at the bottom */}
      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-1000 flex items-center space-x-4 bg-white rounded-lg shadow p-2 text-sm">
        <span className="flex items-center space-x-1">
          <span style={{ width: 16, height: 16, background: '#2563eb', borderRadius: '50%', opacity: 0.5, display: 'inline-block', border: '2px solid #2563eb' }}></span>
          <span className="text-blue-800">Previous Data</span>
        </span>
        <span className="flex items-center space-x-1">
          <span style={{ width: 16, height: 16, background: '#dc2626', borderRadius: '50%', opacity: 0.5, display: 'inline-block', border: '2px solid #dc2626' }}></span>
          <span className="text-red-700">Today's Data</span>
        </span>
      </div>
    </div>
  );
};

export default CombinedMapPage;
