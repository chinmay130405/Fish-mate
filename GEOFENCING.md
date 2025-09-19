# Geofencing Feature Documentation

## Overview
The Fish-mate app now includes comprehensive geofencing functionality that tracks the user's GPS location and provides alerts when crossing regional or country boundaries.

## Features Added

### 1. GPS Location Tracking
- Real-time GPS coordinate monitoring
- High-accuracy position tracking
- Location permission handling
- Position watching with automatic updates

### 2. Geofencing Boundaries
- Support for different boundary types:
  - **Regional**: Territorial waters (12 nautical miles)
  - **Country**: National EEZ boundaries
  - **Restricted**: Naval/military zones
  - **EEZ**: Exclusive Economic Zones

### 3. Boundary Violation Detection
- Point-in-polygon algorithm for boundary checking
- Real-time monitoring of boundary crossings
- Automatic alert generation for violations

### 4. Alert System
- **Entry Alerts**: When entering a boundary zone
- **Exit Alerts**: When leaving a boundary zone  
- **Warning Alerts**: When in restricted areas
- Severity levels: High, Medium, Low
- Dismissible notifications

## Files Added/Modified

### New Files
1. **`src/services/geolocationService.ts`**
   - Core GPS tracking functionality
   - Boundary violation detection
   - Point-in-polygon algorithms

2. **`src/components/GeofenceAlertsComponent.tsx`**
   - UI component for displaying geofencing alerts
   - Real-time location display
   - Toggle controls for enabling/disabling geofencing

3. **`src/hooks/useGeofencing.ts`**
   - React hook for geofencing state management
   - Reusable across components
   - Handles permissions, alerts, and location updates

### Modified Files
1. **`src/data/dummyData.ts`**
   - Added GPS coordinate interfaces
   - Added geofence boundary definitions
   - Added geofence alert data structures

2. **`src/components/AlertsPage.tsx`**
   - Integrated geofencing alerts
   - Added real-time location monitoring
   - Enhanced alert management

3. **`src/components/HomePage.tsx`**
   - Added GPS location display section
   - Real-time coordinate updates
   - Current location marker on map

## Usage Examples

### Using the Geofencing Hook
```typescript
import { useGeofencing } from '../hooks/useGeofencing';

function MyComponent() {
  const {
    currentLocation,
    isEnabled,
    alerts,
    toggleGeofencing,
    dismissAlert
  } = useGeofencing();

  return (
    <div>
      {currentLocation && (
        <p>Current: {currentLocation.latitude}, {currentLocation.longitude}</p>
      )}
    </div>
  );
}
```

### Using the Geolocation Service Directly
```typescript
import { geolocationService } from '../services/geolocationService';

// Request permission and get current location
const hasPermission = await geolocationService.requestPermission();
if (hasPermission) {
  const position = await geolocationService.getCurrentPosition();
  console.log('Location:', position);
}
```

## Configuration

### Geolocation Settings
The geolocation service can be configured with these options:
```typescript
const config = {
  enableHighAccuracy: true,    // Use GPS for high accuracy
  timeout: 10000,             // 10 second timeout
  maximumAge: 30000,          // Cache position for 30 seconds
  watchInterval: 5000         // Update every 5 seconds
};
```

### Boundary Definitions
Boundaries are defined as polygon coordinates:
```typescript
const boundary = {
  id: 'example-zone',
  name: 'Example Restricted Zone',
  type: 'restricted',
  coordinates: [
    [lat1, lng1], [lat2, lng2], [lat3, lng3], [lat1, lng1] // Closed polygon
  ],
  description: 'No entry zone'
};
```

## User Interface

### HomePage GPS Section
- Real-time GPS coordinates display
- Location accuracy information
- Last update timestamp
- Permission status indicator

### Alerts Page Geofencing
- Live boundary violation alerts
- Toggle switch to enable/disable geofencing
- Alert dismissal functionality
- Current location display with accuracy

### Map Integration
- Current location marker (blue dot)
- Boundary zone visualization
- Fishing zone markers with distance from current location

## Browser Compatibility

The geofencing feature requires:
- HTML5 Geolocation API support
- HTTPS connection (required for location access in most browsers)
- User permission to access location

## Privacy & Permissions

- Location data is processed locally on the device
- No location data is transmitted to external servers
- User can enable/disable geofencing at any time
- Respects browser location permission settings

## Testing Boundary Violations

To test the geofencing functionality:
1. Enable location services in your browser
2. Visit the app and grant location permission
3. Navigate to different locations to trigger boundary alerts
4. Use browser developer tools to simulate location changes

## Future Enhancements

Potential improvements:
- Offline boundary data caching
- Custom boundary creation
- Historical location tracking
- Integration with maritime chart data
- Push notifications for background alerts
- Battery optimization for continuous tracking
