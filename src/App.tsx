import { useState } from 'react'
import { Home, FileText, AlertTriangle, User } from 'lucide-react'
import { Routes, Route } from 'react-router-dom';
import HomePage from './components/HomePage'
import ReportsPage from './components/ReportsPage'
import AlertsPage from './components/AlertsPage'
import ProfilePage from './components/ProfilePage'
import ZoneDetailPage from './components/ZoneDetailPage'
import BottomNavigation from './components/BottomNavigation'
import AlertNotificationBar from './components/AlertNotificationBar'
import SOSButton from './components/SOSButton'
import FullMapPage from './components/FullMapPage';
import CombinedMapPage from './components/CombinedMapPage';

type Page = 'home' | 'reports' | 'alerts' | 'profile' | 'zone-detail'

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home')
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null)

  const navigateToZone = (zoneId: string) => {
    setSelectedZoneId(zoneId)
    setCurrentPage('zone-detail')
  }

  const navigateBack = () => {
    setSelectedZoneId(null)
    setCurrentPage('home')
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage onZoneClick={navigateToZone} />
      case 'reports':
        return <ReportsPage />
      case 'alerts':
        return <AlertsPage />
      case 'profile':
        return <ProfilePage />
      case 'zone-detail':
        return selectedZoneId ? <ZoneDetailPage zoneId={selectedZoneId} onBack={navigateBack} /> : <HomePage onZoneClick={navigateToZone} />
      default:
        return <HomePage onZoneClick={navigateToZone} />
    }
  }

  const navigationItems = [
    { id: 'home' as Page, icon: Home, label: 'Home' },
    { id: 'reports' as Page, icon: FileText, label: 'Reports' },
    { id: 'alerts' as Page, icon: AlertTriangle, label: 'Alerts' },
    { id: 'profile' as Page, icon: User, label: 'Profile' }
  ]

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Alert Notification Bar */}
      <AlertNotificationBar />
      {/* Header */}
      <header className="bg-ocean-600 text-white p-4 shadow-lg flex justify-between items-center" style={{backgroundColor: '#0284c7', color: 'white'}}>
        <h1 className="text-xl font-bold flex-1 text-center">Fish Zone Predictor</h1>
      </header>
      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-16">
        <Routes>
          <Route path="/" element={renderPage()} />
          <Route path="/map" element={<FullMapPage />} />
          <Route path="/combined-map" element={<CombinedMapPage />} />
        </Routes>
      </main>
      {/* SOS Button */}
      <SOSButton />
      {/* Bottom Navigation */}
      <BottomNavigation
        items={navigationItems}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
      />
    </div>
  )
}

export default App
