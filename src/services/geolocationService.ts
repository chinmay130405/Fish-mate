import type { GPSCoordinate, GeofenceBoundary, GeofenceAlert } from '../data/dummyData';

export interface GeolocationServiceConfig {
  enableHighAccuracy: boolean;
  timeout: number;
  maximumAge: number;
  watchInterval: number;
}

export class GeolocationService {
  private watchId: number | null = null;
  private currentPosition: GPSCoordinate | null = null;
  private onLocationUpdate?: (position: GPSCoordinate) => void;
  private onGeofenceViolation?: (alert: GeofenceAlert) => void;
  private boundaries: GeofenceBoundary[] = [];
  private config: GeolocationServiceConfig;

  constructor(config?: Partial<GeolocationServiceConfig>) {
    this.config = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 30000,
      watchInterval: 5000,
      ...config
    };
  }

  // Initialize GPS tracking
  async requestPermission(): Promise<boolean> {
    if (!navigator.geolocation) {
      console.error('Geolocation is not supported by this browser');
      return false;
    }

    try {
      // Request permission by attempting to get current position
      await this.getCurrentPosition();
      return true;
    } catch (error) {
      console.error('Geolocation permission denied:', error);
      return false;
    }
  }

  // Get current GPS position
  getCurrentPosition(): Promise<GPSCoordinate> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const gpsCoord: GPSCoordinate = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            timestamp: position.timestamp,
            accuracy: position.coords.accuracy
          };
          this.currentPosition = gpsCoord;
          resolve(gpsCoord);
        },
        (error) => {
          reject(error);
        },
        {
          enableHighAccuracy: this.config.enableHighAccuracy,
          timeout: this.config.timeout,
          maximumAge: this.config.maximumAge
        }
      );
    });
  }

  // Start watching GPS position
  startWatching(
    onLocationUpdate: (position: GPSCoordinate) => void,
    onGeofenceViolation?: (alert: GeofenceAlert) => void
  ): boolean {
    if (!navigator.geolocation) {
      console.error('Geolocation not supported');
      return false;
    }

    this.onLocationUpdate = onLocationUpdate;
    this.onGeofenceViolation = onGeofenceViolation;

    this.watchId = navigator.geolocation.watchPosition(
      (position) => {
        const gpsCoord: GPSCoordinate = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          timestamp: position.timestamp,
          accuracy: position.coords.accuracy
        };

        const previousPosition = this.currentPosition;
        this.currentPosition = gpsCoord;

        // Notify location update
        this.onLocationUpdate?.(gpsCoord);

        // Check for boundary violations
        if (previousPosition) {
          this.checkBoundaryViolations(previousPosition, gpsCoord);
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
      },
      {
        enableHighAccuracy: this.config.enableHighAccuracy,
        timeout: this.config.timeout,
        maximumAge: this.config.maximumAge
      }
    );

    return true;
  }

  // Stop watching GPS position
  stopWatching(): void {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
  }

  // Set boundaries for geofencing
  setBoundaries(boundaries: GeofenceBoundary[]): void {
    this.boundaries = boundaries;
  }

  // Check if current position violates any boundaries
  private checkBoundaryViolations(previousPos: GPSCoordinate, currentPos: GPSCoordinate): void {
    this.boundaries.forEach(boundary => {
      const wasInside = this.isPointInPolygon(previousPos, boundary.coordinates);
      const isInside = this.isPointInPolygon(currentPos, boundary.coordinates);

      if (!wasInside && isInside) {
        // Entered boundary
        this.triggerGeofenceAlert('geofence_entry', boundary, currentPos);
      } else if (wasInside && !isInside) {
        // Exited boundary
        this.triggerGeofenceAlert('geofence_exit', boundary, currentPos);
      } else if (isInside && boundary.type === 'restricted') {
        // Inside restricted area
        this.triggerGeofenceAlert('boundary_warning', boundary, currentPos);
      }
    });
  }

  // Point-in-polygon algorithm using ray casting
  private isPointInPolygon(point: GPSCoordinate, polygon: [number, number][]): boolean {
    const x = point.longitude;
    const y = point.latitude;
    let inside = false;

    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const xi = polygon[i][1]; // longitude
      const yi = polygon[i][0]; // latitude
      const xj = polygon[j][1]; // longitude
      const yj = polygon[j][0]; // latitude

      if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) {
        inside = !inside;
      }
    }

    return inside;
  }



  // Trigger geofence alert
  private triggerGeofenceAlert(
    type: 'geofence_entry' | 'geofence_exit' | 'boundary_warning',
    boundary: GeofenceBoundary,
    location: GPSCoordinate
  ): void {
    const alert: GeofenceAlert = {
      id: `geo-alert-${Date.now()}`,
      type,
      boundaryId: boundary.id,
      boundaryName: boundary.name,
      severity: boundary.type === 'restricted' ? 'high' : 'medium',
      title: this.getAlertTitle(type, boundary),
      description: this.getAlertDescription(type, boundary),
      timestamp: new Date().toISOString(),
      location,
      isActive: true
    };

    this.onGeofenceViolation?.(alert);
  }

  private getAlertTitle(type: string, boundary: GeofenceBoundary): string {
    switch (type) {
      case 'geofence_entry':
        return `Entered ${boundary.name}`;
      case 'geofence_exit':
        return `Exited ${boundary.name}`;
      case 'boundary_warning':
        return `Warning: ${boundary.name}`;
      default:
        return 'Boundary Alert';
    }
  }

  private getAlertDescription(type: string, boundary: GeofenceBoundary): string {
    switch (type) {
      case 'geofence_entry':
        return `You have entered the ${boundary.name}. ${boundary.description}`;
      case 'geofence_exit':
        return `You have exited the ${boundary.name}. ${boundary.description}`;
      case 'boundary_warning':
        if (boundary.type === 'restricted') {
          return `Warning: You are in a restricted area (${boundary.name}). Please exit immediately.`;
        }
        return `You are currently within ${boundary.name}. ${boundary.description}`;
      default:
        return boundary.description;
    }
  }

  // Get current position
  getCurrentGPSPosition(): GPSCoordinate | null {
    return this.currentPosition;
  }

  // Check if position is within any restricted boundary
  isInRestrictedArea(position?: GPSCoordinate): boolean {
    const pos = position || this.currentPosition;
    if (!pos) return false;

    return this.boundaries
      .filter(boundary => boundary.type === 'restricted')
      .some(boundary => this.isPointInPolygon(pos, boundary.coordinates));
  }
}

// Export singleton instance
export const geolocationService = new GeolocationService();
