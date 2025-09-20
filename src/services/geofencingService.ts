import type { BoundaryZone } from '../data/boundaryData';
import { boundaryZones } from '../data/boundaryData';

export interface GeofenceAlert {
  id: string;
  boundaryId: string;
  boundaryName: string;
  type: 'approaching' | 'violation' | 'warning';
  severity: 'high' | 'medium' | 'low';
  distance: number; // in kilometers
  message: string;
  timestamp: Date;
  userLocation: [number, number];
  consequences?: string;
}

export interface GeofenceStatus {
  isInsideBoundary: boolean;
  nearbyBoundaries: Array<{
    boundary: BoundaryZone;
    distance: number;
    isApproaching: boolean;
  }>;
  activeAlerts: GeofenceAlert[];
}

// Haversine formula to calculate distance between two points
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const toRadians = (degrees: number): number => {
  return degrees * (Math.PI / 180);
};

// Point-in-polygon algorithm using ray casting
export const isPointInPolygon = (
  point: [number, number],
  polygon: [number, number][]
): boolean => {
  const [lat, lon] = point;
  let inside = false;
  
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i];
    const [xj, yj] = polygon[j];
    
    if (((yi > lat) !== (yj > lat)) &&
        (lon < (xj - xi) * (lat - yi) / (yj - yi) + xi)) {
      inside = !inside;
    }
  }
  
  return inside;
};

// Calculate minimum distance from point to polygon boundary
export const distanceToPolygon = (
  point: [number, number],
  polygon: [number, number][]
): number => {
  let minDistance = Infinity;
  const [lat, lon] = point;
  
  // Check if point is inside polygon first
  if (isPointInPolygon(point, polygon)) {
    return 0; // Inside the polygon
  }
  
  // Calculate distance to each edge of the polygon
  for (let i = 0; i < polygon.length; i++) {
    const j = (i + 1) % polygon.length;
    const [lat1, lon1] = polygon[i];
    const [lat2, lon2] = polygon[j];
    
    // Distance from point to line segment
    const distance = distancePointToLineSegment(
      lat, lon, lat1, lon1, lat2, lon2
    );
    
    minDistance = Math.min(minDistance, distance);
  }
  
  return minDistance;
};

// Calculate distance from point to line segment
const distancePointToLineSegment = (
  px: number, py: number,
  x1: number, y1: number,
  x2: number, y2: number
): number => {
  const A = px - x1;
  const B = py - y1;
  const C = x2 - x1;
  const D = y2 - y1;
  
  const dot = A * C + B * D;
  const lenSq = C * C + D * D;
  let param = -1;
  
  if (lenSq !== 0) {
    param = dot / lenSq;
  }
  
  let xx, yy;
  
  if (param < 0) {
    xx = x1;
    yy = y1;
  } else if (param > 1) {
    xx = x2;
    yy = y2;
  } else {
    xx = x1 + param * C;
    yy = y1 + param * D;
  }
  
  return calculateDistance(px, py, xx, yy);
};

// Check geofence status for current location
export const checkGeofenceStatus = (
  userLocation: [number, number],
  previousAlerts: GeofenceAlert[] = []
): GeofenceStatus => {
  const nearbyBoundaries: Array<{
    boundary: BoundaryZone;
    distance: number;
    isApproaching: boolean;
  }> = [];
  
  const activeAlerts: GeofenceAlert[] = [];
  let isInsideBoundary = false;
  
  for (const boundary of boundaryZones) {
    const distance = distanceToPolygon(userLocation, boundary.coordinates);
    const isInside = distance === 0;
    
    if (isInside) {
      isInsideBoundary = true;
      
      // Create violation alert
      const alert: GeofenceAlert = {
        id: `violation-${boundary.id}-${Date.now()}`,
        boundaryId: boundary.id,
        boundaryName: boundary.name,
        type: 'violation',
        severity: boundary.severity,
        distance: 0,
        message: `You are currently inside ${boundary.name}. ${boundary.consequences || 'Immediate exit recommended.'}`,
        timestamp: new Date(),
        userLocation,
        consequences: boundary.consequences
      };
      
      activeAlerts.push(alert);
    } else if (distance <= boundary.warningDistance) {
      // Within warning distance
      const isApproaching = checkIfApproaching(boundary, userLocation, previousAlerts);
      
      nearbyBoundaries.push({
        boundary,
        distance,
        isApproaching
      });
      
      // Create approaching alert
      const alert: GeofenceAlert = {
        id: `approaching-${boundary.id}-${Date.now()}`,
        boundaryId: boundary.id,
        boundaryName: boundary.name,
        type: 'approaching',
        severity: boundary.severity,
        distance,
        message: `Approaching ${boundary.name}. Distance: ${distance.toFixed(2)}km. ${boundary.description}`,
        timestamp: new Date(),
        userLocation,
        consequences: boundary.consequences
      };
      
      activeAlerts.push(alert);
    }
  }
  
  return {
    isInsideBoundary,
    nearbyBoundaries,
    activeAlerts
  };
};

// Check if user is approaching a boundary (simple heuristic)
const checkIfApproaching = (
  boundary: BoundaryZone,
  currentLocation: [number, number],
  previousAlerts: GeofenceAlert[]
): boolean => {
  const recentAlerts = previousAlerts
    .filter(alert => alert.boundaryId === boundary.id)
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, 2);
  
  if (recentAlerts.length < 2) return false;
  
  // If recent distance is less than previous distance, user is approaching
  const currentDistance = distanceToPolygon(currentLocation, boundary.coordinates);
  const previousDistance = recentAlerts[1].distance;
  
  return currentDistance < previousDistance;
};

// Get all high-priority boundaries for critical monitoring
export const getCriticalBoundaries = (): BoundaryZone[] => {
  return boundaryZones.filter(boundary => 
    boundary.severity === 'high' || boundary.type === 'military' || boundary.type === 'restricted'
  );
};

// Format distance for display
export const formatDistance = (distance: number): string => {
  if (distance < 1) {
    return `${(distance * 1000).toFixed(0)}m`;
  }
  return `${distance.toFixed(1)}km`;
};

// Get boundary zone by ID
export const getBoundaryById = (id: string): BoundaryZone | undefined => {
  return boundaryZones.find(boundary => boundary.id === id);
};

// Geofencing service class for managing state
export class GeofencingService {
  private alertHistory: GeofenceAlert[] = [];
  private isMonitoring = false;
  private monitoringInterval: number | null = null;
  private alertCallback: (alerts: GeofenceAlert[]) => void = () => {};
  
  constructor() {
    this.loadAlertHistory();
  }
  
  // Start monitoring user location
  startMonitoring(alertCallback: (alerts: GeofenceAlert[]) => void) {
    this.alertCallback = alertCallback;
    this.isMonitoring = true;
    
    // Monitor every 10 seconds
    this.monitoringInterval = setInterval(() => {
      this.checkCurrentLocation();
    }, 10000);
    
    // Initial check
    this.checkCurrentLocation();
  }
  
  // Stop monitoring
  stopMonitoring() {
    this.isMonitoring = false;
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
  }
  
  // Check current location against boundaries
  private checkCurrentLocation() {
    if (!this.isMonitoring) return;
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLocation: [number, number] = [
          position.coords.latitude,
          position.coords.longitude
        ];
        
        const status = checkGeofenceStatus(userLocation, this.alertHistory);
        
        if (status.activeAlerts.length > 0) {
          this.addAlertsToHistory(status.activeAlerts);
          this.alertCallback(status.activeAlerts);
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 30000
      }
    );
  }
  
  // Add alerts to history
  private addAlertsToHistory(alerts: GeofenceAlert[]) {
    this.alertHistory.push(...alerts);
    
    // Keep only last 100 alerts
    if (this.alertHistory.length > 100) {
      this.alertHistory = this.alertHistory.slice(-100);
    }
    
    this.saveAlertHistory();
  }
  
  // Save alert history to localStorage
  private saveAlertHistory() {
    try {
      const serializedHistory = JSON.stringify(
        this.alertHistory.map(alert => ({
          ...alert,
          timestamp: alert.timestamp.toISOString()
        }))
      );
      localStorage.setItem('geofence-alert-history', serializedHistory);
    } catch (error) {
      console.error('Failed to save alert history:', error);
    }
  }
  
  // Load alert history from localStorage
  private loadAlertHistory() {
    try {
      const saved = localStorage.getItem('geofence-alert-history');
      if (saved) {
        const parsed = JSON.parse(saved);
        this.alertHistory = parsed.map((alert: any) => ({
          ...alert,
          timestamp: new Date(alert.timestamp)
        }));
      }
    } catch (error) {
      console.error('Failed to load alert history:', error);
      this.alertHistory = [];
    }
  }
  
  // Get alert history
  getAlertHistory(): GeofenceAlert[] {
    return [...this.alertHistory];
  }
  
  // Clear alert history
  clearAlertHistory() {
    this.alertHistory = [];
    localStorage.removeItem('geofence-alert-history');
  }
}

// Global geofencing service instance
export const geofencingService = new GeofencingService();