import { Polyline } from 'react-leaflet'
import { indiaMarineBoundary, lakshadweepBoundary, andamanNicobarBoundary } from '../data/marineBoundary'

const MarineBoundaryLayer = () => {
  const boundaryStyle = {
    color: '#1e40af', // Blue color
    weight: 2,
    opacity: 0.8,
    dashArray: '10, 10', // Creates dotted line pattern
    fillOpacity: 0
  }

  return (
    <>
      {/* Main India Marine Boundary */}
      <Polyline
        positions={indiaMarineBoundary}
        pathOptions={boundaryStyle}
      />
      
      {/* Lakshadweep Islands Boundary */}
      <Polyline
        positions={lakshadweepBoundary}
        pathOptions={boundaryStyle}
      />
      
      {/* Andaman & Nicobar Islands Boundary */}
      <Polyline
        positions={andamanNicobarBoundary}
        pathOptions={boundaryStyle}
      />
    </>
  )
}

export default MarineBoundaryLayer