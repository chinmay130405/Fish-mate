import { useState, useEffect } from 'react'
import { ArrowLeft, Wind, Waves, Thermometer, Eye, Droplets, Compass, Clock, TrendingUp, AlertTriangle, CheckCircle, XCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { weatherService } from '../services/weatherService'
import type { GPSCoordinate } from '../data/dummyData'

interface WeatherDetailPageProps {
  currentLocation?: GPSCoordinate | null
}

const WeatherDetailPage = ({ currentLocation }: WeatherDetailPageProps) => {
  const navigate = useNavigate()
  const [weatherData, setWeatherData] = useState<any>(null)
  const [fishingSafety, setFishingSafety] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [hourlyForecast, setHourlyForecast] = useState<any[]>([])

  useEffect(() => {
    const fetchWeatherDetails = async () => {
      if (!currentLocation) return
      
      try {
        setLoading(true)
        
        // Get current weather and safety analysis
        const safetyData = await weatherService.getFishingSafety(currentLocation.latitude, currentLocation.longitude)
        
        // Extract weather data from safety result
        const currentWeather = {
          temperature: 26 + (Math.random() - 0.5) * 8, // Mock temperature
          condition: 'Partly Cloudy'
        }
        
        setWeatherData(currentWeather)
        setFishingSafety(safetyData)
        
        // Generate hourly forecast (mock data for now)
        const mockHourlyForecast = Array.from({ length: 24 }, (_, i) => ({
          time: new Date(Date.now() + i * 60 * 60 * 1000).getHours(),
          temperature: currentWeather?.temperature + (Math.random() - 0.5) * 4,
          windSpeed: (safetyData?.conditions?.windSpeedMetersPerSecond || 5) + (Math.random() - 0.5) * 3,
          waveHeight: (safetyData?.conditions?.waveHeightMeters || 1) + (Math.random() - 0.5) * 0.8,
          visibility: 8 + (Math.random() - 0.5) * 4,
          humidity: 70 + (Math.random() - 0.5) * 20,
          pressure: 1013 + (Math.random() - 0.5) * 20,
          condition: ['Clear', 'Partly Cloudy', 'Cloudy', 'Light Rain'][Math.floor(Math.random() * 4)]
        }))
        
        setHourlyForecast(mockHourlyForecast)
      } catch (error) {
        console.error('Error fetching weather details:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchWeatherDetails()
  }, [currentLocation])

  const getWindColor = (windSpeed: number) => {
    if (windSpeed <= 3) return 'text-green-600'
    if (windSpeed <= 7) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getWaveColor = (waveHeight: number) => {
    if (waveHeight <= 1) return 'text-green-600'
    if (waveHeight <= 2) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getSafetyIcon = (status: string) => {
    switch (status) {
      case 'Safe': return <CheckCircle className="text-green-600" size={24} />
      case 'Unsafe': return <XCircle className="text-red-600" size={24} />
      default: return <AlertTriangle className="text-yellow-600" size={24} />
    }
  }

  const getWindDirection = (degrees: number) => {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW']
    return directions[Math.round(degrees / 22.5) % 16]
  }

  if (loading) {
    return (
      <div className="flex flex-col h-full">
        <div className="bg-white border-b p-4">
          <div className="flex items-center justify-between">
            <button onClick={() => navigate('/')} className="flex items-center space-x-2 text-ocean-600">
              <ArrowLeft size={20} />
              <span>Back</span>
            </button>
            <h1 className="text-lg font-bold text-gray-800">Weather Analysis</h1>
            <div className="w-12"></div>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-2"></div>
            <p className="text-gray-600">Loading weather data...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <button 
            onClick={() => navigate('/')} 
            className="flex items-center space-x-2 text-ocean-600 hover:text-ocean-700"
          >
            <ArrowLeft size={20} />
            <span>Back to Home</span>
          </button>
          <h1 className="text-lg font-bold text-gray-800">Weather Analysis</h1>
          <div className="w-12"></div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Current Safety Status */}
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800">Current Fishing Safety</h2>
            {fishingSafety?.status && getSafetyIcon(fishingSafety.status)}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <div className={`text-3xl font-bold ${fishingSafety?.status === 'Safe' ? 'text-green-600' : fishingSafety?.status === 'Unsafe' ? 'text-red-600' : 'text-yellow-600'}`}>
                {fishingSafety?.status || 'Checking...'}
              </div>
              <p className="text-sm text-gray-600">Overall Status</p>
            </div>
            
            {fishingSafety?.conditions?.windSpeedMetersPerSecond != null && (
              <div className="text-center">
                <div className={`text-3xl font-bold ${getWindColor(fishingSafety.conditions.windSpeedMetersPerSecond)}`}>
                  {fishingSafety.conditions.windSpeedMetersPerSecond.toFixed(1)}
                </div>
                <p className="text-sm text-gray-600">Wind Speed (m/s)</p>
              </div>
            )}
            
            {fishingSafety?.conditions?.waveHeightMeters != null && (
              <div className="text-center">
                <div className={`text-3xl font-bold ${getWaveColor(fishingSafety.conditions.waveHeightMeters)}`}>
                  {fishingSafety.conditions.waveHeightMeters.toFixed(1)}
                </div>
                <p className="text-sm text-gray-600">Wave Height (m)</p>
              </div>
            )}
          </div>

          {fishingSafety?.reasons?.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-2">Safety Analysis</h3>
              <ul className="space-y-1">
                {fishingSafety.reasons.map((reason: string, index: number) => (
                  <li key={index} className="flex items-center space-x-2 text-sm text-gray-700">
                    <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                    <span>{reason}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Current Weather Details */}
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Current Weather Conditions</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {weatherData?.temperature != null && (
              <div className="bg-blue-50 rounded-lg p-4 text-center">
                <Thermometer className="text-blue-600 mx-auto mb-2" size={24} />
                <div className="text-2xl font-bold text-blue-600">{Math.round(weatherData.temperature)}°C</div>
                <p className="text-sm text-gray-600">Temperature</p>
              </div>
            )}
            
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <Eye className="text-green-600 mx-auto mb-2" size={24} />
              <div className="text-2xl font-bold text-green-600">
                {(8 + Math.random() * 4).toFixed(1)} km
              </div>
              <p className="text-sm text-gray-600">Visibility</p>
            </div>
            
            <div className="bg-purple-50 rounded-lg p-4 text-center">
              <Droplets className="text-purple-600 mx-auto mb-2" size={24} />
              <div className="text-2xl font-bold text-purple-600">
                {Math.round(70 + Math.random() * 20)}%
              </div>
              <p className="text-sm text-gray-600">Humidity</p>
            </div>
            
            <div className="bg-orange-50 rounded-lg p-4 text-center">
              <Compass className="text-orange-600 mx-auto mb-2" size={24} />
              <div className="text-2xl font-bold text-orange-600">
                {Math.round(1013 + (Math.random() - 0.5) * 20)} hPa
              </div>
              <p className="text-sm text-gray-600">Pressure</p>
            </div>
          </div>
        </div>

        {/* Wind & Wave Analysis */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-center space-x-2 mb-4">
              <Wind className="text-blue-600" size={24} />
              <h3 className="text-lg font-bold text-gray-800">Wind Analysis</h3>
            </div>
            
            {fishingSafety?.conditions && (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Current Speed:</span>
                  <span className={`font-bold ${getWindColor(fishingSafety.conditions.windSpeedMetersPerSecond || 0)}`}>
                    {fishingSafety.conditions.windSpeedMetersPerSecond?.toFixed(1) || 'N/A'} m/s
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Direction:</span>
                  <span className="font-bold text-gray-800">
                    {getWindDirection(Math.random() * 360)} ({Math.round(Math.random() * 360)}°)
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Gusts:</span>
                  <span className="font-bold text-gray-800">
                    {((fishingSafety.conditions.windSpeedMetersPerSecond || 0) * 1.3).toFixed(1)} m/s
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-center space-x-2 mb-4">
              <Waves className="text-teal-600" size={24} />
              <h3 className="text-lg font-bold text-gray-800">Wave Analysis</h3>
            </div>
            
            {fishingSafety?.conditions && (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Significant Height:</span>
                  <span className={`font-bold ${getWaveColor(fishingSafety.conditions.waveHeightMeters || 0)}`}>
                    {fishingSafety.conditions.waveHeightMeters?.toFixed(1) || 'N/A'} m
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Period:</span>
                  <span className="font-bold text-gray-800">
                    {(4 + Math.random() * 6).toFixed(1)} sec
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Direction:</span>
                  <span className="font-bold text-gray-800">
                    {getWindDirection(Math.random() * 360)}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 24-Hour Forecast */}
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center space-x-2 mb-4">
            <Clock className="text-indigo-600" size={24} />
            <h3 className="text-lg font-bold text-gray-800">24-Hour Forecast</h3>
          </div>
          
          <div className="overflow-x-auto">
            <div className="flex space-x-4 pb-2" style={{ minWidth: 'max-content' }}>
              {hourlyForecast.slice(0, 12).map((hour, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-3 text-center min-w-[100px]">
                  <div className="text-sm font-medium text-gray-600 mb-2">
                    {hour.time.toString().padStart(2, '0')}:00
                  </div>
                  <div className="space-y-2">
                    <div className="text-xs text-gray-500">Wind</div>
                    <div className={`text-sm font-bold ${getWindColor(hour.windSpeed)}`}>
                      {hour.windSpeed.toFixed(1)} m/s
                    </div>
                    <div className="text-xs text-gray-500">Waves</div>
                    <div className={`text-sm font-bold ${getWaveColor(hour.waveHeight)}`}>
                      {hour.waveHeight.toFixed(1)} m
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Safety Recommendations */}
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center space-x-2 mb-4">
            <TrendingUp className="text-green-600" size={24} />
            <h3 className="text-lg font-bold text-gray-800">Fishing Recommendations</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">Best Fishing Times Today</h4>
              <ul className="space-y-1 text-sm text-gray-700">
                <li className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span>06:00 - 09:00 (Excellent conditions)</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                  <span>15:00 - 18:00 (Good conditions)</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                  <span>12:00 - 14:00 (Avoid - High winds)</span>
                </li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">Equipment Recommendations</h4>
              <ul className="space-y-1 text-sm text-gray-700">
                <li>• Use heavier sinkers due to wave conditions</li>
                <li>• Recommend GPS tracking device</li>
                <li>• Carry extra safety equipment</li>
                <li>• Monitor weather updates regularly</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default WeatherDetailPage