export interface BoundaryZone {
  id: string;
  name: string;
  type: 'territorial' | 'eez' | 'restricted' | 'military' | 'conservation';
  severity: 'high' | 'medium' | 'low';
  coordinates: [number, number][];
  description: string;
  warningDistance: number; // in kilometers
  consequences?: string;
}

// Indian Maritime Boundaries and Restricted Zones
export const boundaryZones: BoundaryZone[] = [
  // Indian Exclusive Economic Zone (EEZ) - Western Coast
  {
    id: 'india-eez-west',
    name: 'Indian EEZ - Western Coast',
    type: 'eez',
    severity: 'high',
    warningDistance: 2,
    description: 'Indian Exclusive Economic Zone - 200 nautical miles from baseline',
    consequences: 'Fishing beyond EEZ requires special permits and international agreements',
    coordinates: [
      [8.4, 68.0],   // Southern tip near Kanyakumari
      [23.0, 68.0],  // Gujarat coast
      [23.5, 67.0],  // Kutch region
      [22.5, 68.5],  // Saurashtra
      [21.0, 70.0],  // Maharashtra coast
      [19.0, 72.0],  // Mumbai region
      [15.5, 73.5],  // Goa region
      [12.0, 75.0],  // Karnataka coast
      [10.0, 76.0],  // Kerala coast
      [8.0, 77.0],   // Tamil Nadu coast
      [8.4, 68.0]    // Close polygon
    ]
  },

  // Indian Territorial Waters (12 nautical miles)
  {
    id: 'india-territorial-west',
    name: 'Indian Territorial Waters - West Coast',
    type: 'territorial',
    severity: 'medium',
    warningDistance: 2,
    description: 'Indian territorial waters - 12 nautical miles from baseline',
    consequences: 'Entry restricted for foreign vessels without permission',
    coordinates: [
      [8.5, 76.8],
      [22.8, 68.2],
      [23.2, 68.0],
      [22.3, 68.8],
      [20.8, 70.2],
      [18.8, 72.2],
      [15.3, 73.7],
      [11.8, 75.2],
      [9.8, 76.2],
      [8.2, 77.2],
      [8.5, 76.8]
    ]
  },

  // Pakistan Maritime Boundary
  {
    id: 'pakistan-boundary',
    name: 'India-Pakistan Maritime Boundary',
    type: 'restricted',
    severity: 'high',
    warningDistance: 5,
    description: 'International maritime boundary between India and Pakistan',
    consequences: 'Crossing without authorization may lead to detention by naval forces',
    coordinates: [
      [23.8, 68.0],
      [24.0, 67.8],
      [24.2, 67.5],
      [24.5, 67.0],
      [25.0, 66.5],
      [24.8, 66.8],
      [24.5, 67.3],
      [24.2, 67.8],
      [23.8, 68.0]
    ]
  },

  // Sri Lanka Maritime Boundary
  {
    id: 'srilanka-boundary',
    name: 'India-Sri Lanka Maritime Boundary',
    type: 'restricted',
    severity: 'high',
    warningDistance: 2,
    description: 'International maritime boundary between India and Sri Lanka',
    consequences: 'Illegal crossing may result in arrest by Sri Lankan Navy',
    coordinates: [
      [9.2, 79.5],
      [8.5, 81.0],
      [7.8, 81.5],
      [7.0, 81.8],
      [6.5, 81.5],
      [7.0, 81.0],
      [7.5, 80.5],
      [8.0, 80.0],
      [8.5, 79.8],
      [9.2, 79.5]
    ]
  },

  // Naval Restricted Areas
  {
    id: 'mumbai-naval-restricted',
    name: 'Mumbai Naval Restricted Zone',
    type: 'military',
    severity: 'high',
    warningDistance: 3,
    description: 'Naval base restricted area - Mumbai',
    consequences: 'Entry prohibited - Naval security enforcement',
    coordinates: [
      [18.9, 72.7],
      [19.0, 72.8],
      [19.1, 72.9],
      [19.0, 73.0],
      [18.9, 72.9],
      [18.8, 72.8],
      [18.9, 72.7]
    ]
  },

  {
    id: 'kochi-naval-restricted',
    name: 'Kochi Naval Restricted Zone',
    type: 'military',
    severity: 'high',
    warningDistance: 3,
    description: 'Naval base restricted area - Kochi',
    consequences: 'Entry prohibited - Naval security enforcement',
    coordinates: [
      [9.9, 76.2],
      [10.0, 76.3],
      [10.1, 76.2],
      [10.0, 76.1],
      [9.9, 76.2]
    ]
  },

  {
    id: 'vizag-naval-restricted',
    name: 'Visakhapatnam Naval Restricted Zone',
    type: 'military',
    severity: 'high',
    warningDistance: 3,
    description: 'Naval base restricted area - Visakhapatnam',
    consequences: 'Entry prohibited - Naval security enforcement',
    coordinates: [
      [17.6, 83.2],
      [17.7, 83.3],
      [17.8, 83.2],
      [17.7, 83.1],
      [17.6, 83.2]
    ]
  },

  // Marine Protected Areas
  {
    id: 'gulf-mannar-marine-park',
    name: 'Gulf of Mannar Marine National Park',
    type: 'conservation',
    severity: 'medium',
    warningDistance: 1,
    description: 'Protected marine ecosystem - fishing restrictions apply',
    consequences: 'Fishing prohibited without proper permits from forest department',
    coordinates: [
      [8.8, 78.8],
      [9.2, 79.2],
      [9.0, 79.4],
      [8.6, 79.0],
      [8.8, 78.8]
    ]
  },

  {
    id: 'sundarbans-reserve',
    name: 'Sundarbans Marine Reserve',
    type: 'conservation',
    severity: 'medium',
    warningDistance: 1,
    description: 'UNESCO World Heritage marine reserve',
    consequences: 'Restricted fishing area - special permits required',
    coordinates: [
      [21.8, 88.8],
      [22.4, 89.2],
      [22.2, 89.6],
      [21.6, 89.2],
      [21.8, 88.8]
    ]
  }
];

// Utility function to get boundary zones by type
export const getBoundaryZonesByType = (type: BoundaryZone['type']): BoundaryZone[] => {
  return boundaryZones.filter(zone => zone.type === type);
};

// Utility function to get high severity zones
export const getHighSeverityZones = (): BoundaryZone[] => {
  return boundaryZones.filter(zone => zone.severity === 'high');
};

// Color mapping for different boundary types
export const boundaryColors = {
  territorial: '#3B82F6', // Blue
  eez: '#10B981',         // Green
  restricted: '#EF4444',  // Red
  military: '#DC2626',    // Dark Red
  conservation: '#F59E0B' // Amber
};

// Style configuration for map rendering
export const boundaryStyles = {
  territorial: {
    color: boundaryColors.territorial,
    weight: 2,
    opacity: 0.8,
    fillOpacity: 0.1,
    dashArray: '5, 5'
  },
  eez: {
    color: boundaryColors.eez,
    weight: 3,
    opacity: 0.9,
    fillOpacity: 0.05,
    dashArray: '10, 5'
  },
  restricted: {
    color: boundaryColors.restricted,
    weight: 4,
    opacity: 1,
    fillOpacity: 0.2,
    dashArray: '0'
  },
  military: {
    color: boundaryColors.military,
    weight: 3,
    opacity: 1,
    fillOpacity: 0.3,
    dashArray: '0'
  },
  conservation: {
    color: boundaryColors.conservation,
    weight: 2,
    opacity: 0.8,
    fillOpacity: 0.15,
    dashArray: '8, 4'
  }
};