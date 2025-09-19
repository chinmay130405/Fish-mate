import { useState, useEffect, useCallback } from 'react';
import { geolocationService } from '../services/geolocationService';
import { geofenceBoundaries } from '../data/dummyData';
import type { GPSCoordinate, GeofenceAlert } from '../data/dummyData';

export interface UseGeofencingReturn {
  currentLocation: GPSCoordinate | null;
  isEnabled: boolean;
  permission: 'granted' | 'denied' | 'pending';
  alerts: GeofenceAlert[];
  isLoading: boolean;
  error: string | null;
  toggleGeofencing: (enabled: boolean) => void;
  dismissAlert: (alertId: string) => void;
  refreshLocation: () => Promise<void>;
}

export const useGeofencing = (): UseGeofencingReturn => {
  const [currentLocation, setCurrentLocation] = useState<GPSCoordinate | null>(null);
  const [isEnabled, setIsEnabled] = useState<boolean>(true);
  const [permission, setPermission] = useState<'granted' | 'denied' | 'pending'>('pending');
  const [alerts, setAlerts] = useState<GeofenceAlert[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const initializeGeofencing = useCallback(async () => {
    if (!isEnabled) {
      geolocationService.stopWatching();
      setCurrentLocation(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const hasPermission = await geolocationService.requestPermission();
      
      if (hasPermission) {
        setPermission('granted');
        
        // Set boundaries for geofencing
        geolocationService.setBoundaries(geofenceBoundaries);
        
        // Get initial position
        const position = await geolocationService.getCurrentPosition();
        setCurrentLocation(position);
        
        // Start watching location
        geolocationService.startWatching(
          (position) => {
            setCurrentLocation(position);
            setError(null);
          },
          (alert) => {
            setAlerts(prev => {
              // Check if alert already exists to avoid duplicates
              const exists = prev.some(existing => existing.id === alert.id);
              if (exists) return prev;
              return [...prev, alert];
            });
          }
        );
      } else {
        setPermission('denied');
        setError('Location permission denied');
      }
    } catch (err) {
      setPermission('denied');
      setError(err instanceof Error ? err.message : 'Failed to initialize geofencing');
      console.error('Geofencing initialization error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [isEnabled]);

  const toggleGeofencing = useCallback((enabled: boolean) => {
    setIsEnabled(enabled);
    if (!enabled) {
      geolocationService.stopWatching();
      setCurrentLocation(null);
      setAlerts([]);
    }
  }, []);

  const dismissAlert = useCallback((alertId: string) => {
    setAlerts(prev => 
      prev.map(alert => 
        alert.id === alertId ? { ...alert, isActive: false } : alert
      )
    );
  }, []);

  const refreshLocation = useCallback(async () => {
    if (!isEnabled || permission !== 'granted') return;

    setIsLoading(true);
    try {
      const position = await geolocationService.getCurrentPosition();
      setCurrentLocation(position);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh location');
    } finally {
      setIsLoading(false);
    }
  }, [isEnabled, permission]);

  useEffect(() => {
    initializeGeofencing();

    return () => {
      geolocationService.stopWatching();
    };
  }, [initializeGeofencing]);

  return {
    currentLocation,
    isEnabled,
    permission,
    alerts,
    isLoading,
    error,
    toggleGeofencing,
    dismissAlert,
    refreshLocation
  };
};
