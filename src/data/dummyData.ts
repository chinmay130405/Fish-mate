// Dummy data for the fishing zone prediction app

export interface FishingZone {
  id: string;
  name: string;
  coordinates: [number, number];
  probability: 'high' | 'medium' | 'low';
  temperature: number;
  depth: number;
  fishType: string[];
}

export interface Alert {
  id: string;
  type: 'weather' | 'boundary' | 'seasonal';
  severity: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  timestamp: string;
  isActive: boolean;
}

export interface TripSummary {
  month: string;
  trips: number;
  distance: number;
  catchProbability: number;
  fuelUsed: number;
}

export interface UserProfile {
  name: string;
  boatId: string;
  licenseNumber: string;
  phone: string;
  language: string;
  totalTrips: number;
  avgCatch: number;
}

// Dummy fishing zones in ocean areas around Indian coast
export const fishingZones: FishingZone[] = [
  {
    id: 'pfz-001',
    name: 'Zone Alpha',
    coordinates: [18.8500, 72.3000], // West of Mumbai in Arabian Sea
    probability: 'high',
    temperature: 28.5,
    depth: 45,
    fishType: ['Mackerel', 'Sardine', 'Pomfret']
  },
  {
    id: 'pfz-002',
    name: 'Zone Beta',
    coordinates: [18.6000, 72.2000], // Southwest of Mumbai coast
    probability: 'medium',
    temperature: 27.8,
    depth: 38,
    fishType: ['Kingfish', 'Tuna']
  },
  {
    id: 'pfz-003',
    name: 'Zone Gamma',
    coordinates: [19.2000, 72.1500], // Northwest of Mumbai in deep waters
    probability: 'high',
    temperature: 29.2,
    depth: 52,
    fishType: ['Snapper', 'Grouper', 'Mackerel']
  },
  {
    id: 'pfz-004',
    name: 'Zone Delta',
    coordinates: [18.4000, 71.9000], // Far southwest in Arabian Sea
    probability: 'low',
    temperature: 26.5,
    depth: 65,
    fishType: ['Pomfret', 'Sole']
  },
  {
    id: 'pfz-005',
    name: 'Zone Echo',
    coordinates: [19.4000, 72.0000], // North of Mumbai in deep waters
    probability: 'medium',
    temperature: 28.1,
    depth: 58,
    fishType: ['Tuna', 'Barracuda', 'Mackerel']
  }
];

export const alerts: Alert[] = [
  {
    id: 'alert-001',
    type: 'weather',
    severity: 'low',
    title: 'Safe Seas',
    description: 'Weather conditions are favorable for fishing. Wind speed: 8-12 knots.',
    timestamp: '2025-09-06T06:00:00Z',
    isActive: true
  },
  {
    id: 'alert-002',
    type: 'boundary',
    severity: 'medium',
    title: 'Boundary Alert',
    description: 'You are approaching the 12 nautical mile boundary. Please maintain safe distance.',
    timestamp: '2025-09-06T05:30:00Z',
    isActive: true
  },
  {
    id: 'alert-003',
    type: 'seasonal',
    severity: 'high',
    title: 'Government Notice',
    description: 'New fishing regulations effective from Sept 10. Check local fisheries office for details.',
    timestamp: '2025-09-06T08:00:00Z',
    isActive: true
  },
  {
    id: 'alert-004',
    type: 'seasonal',
    severity: 'high',
    title: 'Monsoon Season',
    description: 'Monsoon fishing ban is active from June 1 to August 31. Check local regulations.',
    timestamp: '2025-09-05T12:00:00Z',
    isActive: false
  },
  {
    id: 'alert-005',
    type: 'weather',
    severity: 'high',
    title: 'Cyclone Warning',
    description: 'Cyclonic disturbance detected 200km southwest. Avoid deep sea fishing.',
    timestamp: '2025-09-04T18:00:00Z',
    isActive: false
  }
];

export const tripSummary: TripSummary[] = [
  { month: 'January', trips: 12, distance: 145.6, catchProbability: 78, fuelUsed: 89.2 },
  { month: 'February', trips: 15, distance: 189.3, catchProbability: 82, fuelUsed: 112.5 },
  { month: 'March', trips: 18, distance: 234.7, catchProbability: 85, fuelUsed: 142.8 },
  { month: 'April', trips: 14, distance: 167.2, catchProbability: 79, fuelUsed: 98.6 },
  { month: 'May', trips: 10, distance: 123.8, catchProbability: 72, fuelUsed: 75.4 },
  { month: 'June', trips: 0, distance: 0, catchProbability: 0, fuelUsed: 0 }, // Monsoon ban
  { month: 'July', trips: 0, distance: 0, catchProbability: 0, fuelUsed: 0 }, // Monsoon ban
  { month: 'August', trips: 0, distance: 0, catchProbability: 0, fuelUsed: 0 }, // Monsoon ban
  { month: 'September', trips: 16, distance: 198.5, catchProbability: 88, fuelUsed: 125.3 },
  { month: 'October', trips: 20, distance: 256.9, catchProbability: 91, fuelUsed: 158.7 },
  { month: 'November', trips: 19, distance: 241.3, catchProbability: 89, fuelUsed: 147.9 },
  { month: 'December', trips: 17, distance: 213.6, catchProbability: 86, fuelUsed: 134.2 }
];

export const userProfile: UserProfile = {
  name: 'Rajesh Kumar',
  boatId: 'MH-FB-1234',
  licenseNumber: 'FL-2024-5678',
  phone: '+91 98765 43210',
  language: 'English',
  totalTrips: 156,
  avgCatch: 24.5
};

export const quickStats = {
  todayZones: 5,
  weatherStatus: 'Safe',
  boundaryStatus: 'Within Limits',
  activeAlerts: alerts.filter(alert => alert.isActive).length
};
