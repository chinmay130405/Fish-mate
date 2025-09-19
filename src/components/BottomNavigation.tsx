import { useLocation, useNavigate } from 'react-router-dom'

interface NavigationItem {
  id: string
  icon: any
  label: string
  route: string
}

interface BottomNavigationProps {
  items: NavigationItem[]
}

const BottomNavigation = ({ items }: BottomNavigationProps) => {
  const location = useLocation()
  const navigate = useNavigate()
  const currentPath = location.pathname

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
      <div className="flex justify-around items-center h-16">
        {items.map((item) => {
          const Icon = item.icon
          const isActive = currentPath === item.route
          
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.route)}
              className={`flex flex-col items-center justify-center w-full h-full transition-colors ${
                isActive
                  ? 'text-ocean-600 bg-ocean-50'
                  : 'text-gray-500 hover:text-ocean-600'
              }`}
            >
              <Icon size={20} className="mb-1" />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}

export default BottomNavigation
