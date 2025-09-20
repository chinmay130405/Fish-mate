import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import { indianEEZBoundary, andamanNicobarEEZBoundary, lakshadweepEEZBoundary } from '../data/boundaryData';

const EEZBoundary = () => {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    // Create polygon layers for each EEZ boundary
    const mainEEZPolygon = L.polygon(indianEEZBoundary as [number, number][], {
      color: '#8B0000', // Dark red color
      weight: 3,
      opacity: 0.8,
      fillColor: '#8B0000',
      fillOpacity: 0.1,
      dashArray: '5, 5' // Dashed line style
    }).addTo(map);

    const andamanEEZPolygon = L.polygon(andamanNicobarEEZBoundary as [number, number][], {
      color: '#8B0000', // Dark red color
      weight: 3,
      opacity: 0.8,
      fillColor: '#8B0000',
      fillOpacity: 0.1,
      dashArray: '5, 5' // Dashed line style
    }).addTo(map);

    const lakshadweepEEZPolygon = L.polygon(lakshadweepEEZBoundary as [number, number][], {
      color: '#8B0000', // Dark red color
      weight: 3,
      opacity: 0.8,
      fillColor: '#8B0000',
      fillOpacity: 0.1,
      dashArray: '5, 5' // Dashed line style
    }).addTo(map);

    // Add popup with boundary information
    const boundaryPopupContent = `
      <div style="text-align: center; font-family: Arial, sans-serif;">
        <h4 style="margin: 0 0 8px 0; color: #8B0000;">Indian EEZ Boundary</h4>
        <p style="margin: 0; font-size: 12px; color: #666;">
          200 Nautical Miles<br/>
          Exclusive Economic Zone
        </p>
      </div>
    `;

    mainEEZPolygon.bindPopup(boundaryPopupContent);
    andamanEEZPolygon.bindPopup(boundaryPopupContent);
    lakshadweepEEZPolygon.bindPopup(boundaryPopupContent);

    // Cleanup function
    return () => {
      if (map.hasLayer(mainEEZPolygon)) {
        map.removeLayer(mainEEZPolygon);
      }
      if (map.hasLayer(andamanEEZPolygon)) {
        map.removeLayer(andamanEEZPolygon);
      }
      if (map.hasLayer(lakshadweepEEZPolygon)) {
        map.removeLayer(lakshadweepEEZPolygon);
      }
    };
  }, [map]);

  return null;
};

export default EEZBoundary;
