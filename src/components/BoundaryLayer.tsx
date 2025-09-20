import { useEffect } from 'react'
import { useMap } from 'react-leaflet'
import L from 'leaflet'
import type { BoundaryZone } from '../data/boundaryData'
import { boundaryZones, boundaryStyles } from '../data/boundaryData'

interface BoundaryLayerProps {
  showBoundaries?: boolean
  onBoundaryClick?: (boundary: BoundaryZone) => void
}

const BoundaryLayer = ({ showBoundaries = true, onBoundaryClick }: BoundaryLayerProps) => {
  const map = useMap()

  useEffect(() => {
    if (!map || !showBoundaries) return

    const boundaryLayerGroup = L.layerGroup()
    const createdLayers: L.Polygon[] = []

    // Add each boundary zone to the map
    boundaryZones.forEach((boundary) => {
      const coordinates = boundary.coordinates.map(coord => [coord[0], coord[1]] as [number, number])
      const style = boundaryStyles[boundary.type]

      // Create polygon
      const polygon = L.polygon(coordinates, {
        ...style,
        className: `boundary-${boundary.type}`
      })

      // Add popup with boundary information
      const popupContent = `
        <div class="boundary-popup">
          <h3 class="font-bold text-sm mb-2 text-gray-800">${boundary.name}</h3>
          <p class="text-xs text-gray-600 mb-2">${boundary.description}</p>
          <div class="text-xs">
            <div class="flex items-center mb-1">
              <span class="font-semibold text-gray-700 mr-1">Type:</span>
              <span class="capitalize px-2 py-1 rounded text-xs ${getBadgeClass(boundary.type)}">${boundary.type}</span>
            </div>
            <div class="flex items-center mb-1">
              <span class="font-semibold text-gray-700 mr-1">Severity:</span>
              <span class="capitalize px-2 py-1 rounded text-xs ${getSeverityBadgeClass(boundary.severity)}">${boundary.severity}</span>
            </div>
            <div class="flex items-center mb-2">
              <span class="font-semibold text-gray-700 mr-1">Warning Distance:</span>
              <span class="text-gray-800">${boundary.warningDistance}km</span>
            </div>
            ${boundary.consequences ? `<p class="text-xs text-red-600 bg-red-50 p-2 rounded mt-2"><strong>⚠️ Warning:</strong> ${boundary.consequences}</p>` : ''}
          </div>
        </div>
      `

      polygon.bindPopup(popupContent, {
        maxWidth: 300,
        className: 'boundary-popup-container'
      })

      // Add click handler
      if (onBoundaryClick) {
        polygon.on('click', () => {
          onBoundaryClick(boundary)
        })
      }

      // Add hover effects
      polygon.on('mouseover', function(this: L.Polygon) {
        this.setStyle({
          fillOpacity: style.fillOpacity + 0.1,
          weight: style.weight + 1
        })
      })

      polygon.on('mouseout', function(this: L.Polygon) {
        this.setStyle({
          fillOpacity: style.fillOpacity,
          weight: style.weight
        })
      })

      createdLayers.push(polygon)
      boundaryLayerGroup.addLayer(polygon)
    })

    // Add the layer group to the map
    boundaryLayerGroup.addTo(map)

    // Add custom styles to the map container
    const mapContainer = map.getContainer()
    const style = document.createElement('style')
    style.textContent = `
      .boundary-popup-container .leaflet-popup-content-wrapper {
        background: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        border: 1px solid #e5e7eb;
      }
      
      .boundary-popup-container .leaflet-popup-tip {
        background: white;
        border: 1px solid #e5e7eb;
      }
      
      .boundary-popup h3 {
        color: #1f2937;
        border-bottom: 1px solid #e5e7eb;
        padding-bottom: 4px;
        margin-bottom: 8px;
      }
      
      .boundary-territorial { stroke-dasharray: 5,5; }
      .boundary-eez { stroke-dasharray: 10,5; }
      .boundary-restricted { stroke-dasharray: none; }
      .boundary-military { stroke-dasharray: none; }
      .boundary-conservation { stroke-dasharray: 8,4; }
    `
    mapContainer.appendChild(style)

    // Cleanup function
    return () => {
      map.removeLayer(boundaryLayerGroup)
      if (mapContainer.contains(style)) {
        mapContainer.removeChild(style)
      }
    }
  }, [map, showBoundaries, onBoundaryClick])

  return null
}

// Helper functions for badge classes
const getBadgeClass = (type: string): string => {
  switch (type) {
    case 'territorial':
      return 'bg-blue-100 text-blue-800'
    case 'eez':
      return 'bg-green-100 text-green-800'
    case 'restricted':
      return 'bg-red-100 text-red-800'
    case 'military':
      return 'bg-red-200 text-red-900'
    case 'conservation':
      return 'bg-amber-100 text-amber-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const getSeverityBadgeClass = (severity: string): string => {
  switch (severity) {
    case 'high':
      return 'bg-red-100 text-red-800'
    case 'medium':
      return 'bg-yellow-100 text-yellow-800'
    case 'low':
      return 'bg-green-100 text-green-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

export default BoundaryLayer