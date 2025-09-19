import { MapContainer, TileLayer, Circle, Popup, useMap } from 'react-leaflet';
import 'leaflet.heat';
import { useEffect, useState } from 'react';

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

const FullMapPage = () => {
  const [clusters, setClusters] = useState<any[]>([]);

  useEffect(() => {
    fetch('/clusters100.json')
      .then(res => res.json())
      .then(data => setClusters(data))
      .catch(() => setClusters([]));
  }, []);

  return (
    <div className="w-screen h-screen">
      <MapContainer
        center={[18.9000, 72.2000]}
        zoom={10}
        style={{ height: '100vh', width: '100vw' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
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
      </MapContainer>
    </div>
  );
};

export default FullMapPage;
