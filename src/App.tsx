import { useEffect, useState } from 'react'
import { Home, FileText, AlertTriangle, User } from 'lucide-react'
import { Routes, Route } from 'react-router-dom';
import HomePage from './components/HomePage'
import ReportsPage from './components/ReportsPage'
import AlertsPage from './components/AlertsPage'
import ProfilePage from './components/ProfilePage'
import BottomNavigation from './components/BottomNavigation'
import AlertNotificationBar from './components/AlertNotificationBar'
import SOSButton from './components/SOSButton'
import FullMapPage from './components/FullMapPage';
import CombinedMapPage from './components/CombinedMapPage';
import { geolocationService } from './services/geolocationService';
import type { GPSCoordinate } from './data/dummyData';

function App() {
  const [currentLocation, setCurrentLocation] = useState<GPSCoordinate | null>(null);
  const [locationPermission, setLocationPermission] = useState<'granted' | 'denied' | 'pending'>('pending');

  useEffect(() => {
    const initializeLocation = async () => {
      try {
        const hasPermission = await geolocationService.requestPermission();
        if (hasPermission) {
          setLocationPermission('granted');
          const position = await geolocationService.getCurrentPosition();
          setCurrentLocation(position);
          geolocationService.startWatching((position) => {
            setCurrentLocation(position);
          });
        } else {
          setLocationPermission('denied');
        }
      } catch (error) {
        setLocationPermission('denied');
      }
    };
    initializeLocation();
    return () => {
      geolocationService.stopWatching();
    };
  }, []);

  const navigationItems = [
    { id: 'home', icon: Home, label: 'Home', route: '/' },
    { id: 'reports', icon: FileText, label: 'Reports', route: '/reports' },
    { id: 'alerts', icon: AlertTriangle, label: 'Alerts', route: '/alerts' },
    { id: 'profile', icon: User, label: 'Profile', route: '/profile' }
  ];

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Alert Notification Bar */}
      <AlertNotificationBar />
      {/* Header */}
      <header className="bg-ocean-600 text-white p-4 shadow-lg flex justify-between items-center" style={{backgroundColor: '#0284c7', color: 'white'}}>
        <h1 className="text-xl font-bold flex-1 text-center">Sagar Setu</h1>
      </header>
      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-16">
        <Routes>
          <Route path="/" element={<HomePage currentLocation={currentLocation} locationPermission={locationPermission} />} />
          <Route path="/map" element={<FullMapPage currentLocation={currentLocation} />} />
          <Route path="/combined-map" element={<CombinedMapPage currentLocation={currentLocation} />} />
          <Route path="/full-map" element={<FullMapPage currentLocation={currentLocation} />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/alerts" element={<AlertsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Routes>
      </main>
      {/* SOS Button */}
      <SOSButton />
      {/* Bottom Navigation */}
      <BottomNavigation items={navigationItems} />
    </div>
  )
}

export default App
