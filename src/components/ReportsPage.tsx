import { Calendar, TrendingUp, Fuel, Target, Leaf, MapPin, Award } from 'lucide-react'
import { tripSummary } from '../data/dummyData'
import { useTranslation } from 'react-i18next'
import { useState, useEffect } from 'react'
import { journeyTrackingService, type JourneyData, type JourneyStats } from '../services/journeyTrackingService'

const ReportsPage = () => {
  const [journeyStats, setJourneyStats] = useState<JourneyStats | null>(null)
  const [recentJourneys, setRecentJourneys] = useState<JourneyData[]>([])

  useEffect(() => {
    // Load journey tracking data
    const stats = journeyTrackingService.getJourneyStats()
    const history = journeyTrackingService.getJourneyHistory()
    
    setJourneyStats(stats)
    setRecentJourneys(history.slice(0, 5)) // Show latest 5 journeys
  }, [])
  const totalTrips = tripSummary.reduce((sum, month) => sum + month.trips, 0)
  const totalDistance = tripSummary.reduce((sum, month) => sum + month.distance, 0)
  const avgCatchProbability = Math.round(
    tripSummary.reduce((sum, month) => sum + month.catchProbability, 0) / tripSummary.length
  )
  const totalFuel = tripSummary.reduce((sum, month) => sum + month.fuelUsed, 0)

  const currentDate = new Date()
  const currentMonth = currentDate.toLocaleString('default', { month: 'long' })

  const { t } = useTranslation()
  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="bg-white rounded-lg p-4 shadow-sm border">
        <h1 className="text-xl font-bold text-gray-800 mb-2">{t('reports.header')}</h1>
        <p className="text-gray-600">{t('reports.subheader')}</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <div className="flex items-center space-x-2">
            <Calendar className="text-ocean-600" size={20} />
            <div>
              <p className="text-sm text-gray-600">{t('reports.totalTrips')}</p>
              <p className="text-xl font-bold text-ocean-700">{totalTrips}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <div className="flex items-center space-x-2">
            <TrendingUp className="text-green-600" size={20} />
            <div>
              <p className="text-sm text-gray-600">{t('reports.totalDistance')}</p>
              <p className="text-lg font-bold text-green-700">{totalDistance.toFixed(1)} km</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <div className="flex items-center space-x-2">
            <Target className="text-blue-600" size={20} />
            <div>
              <p className="text-sm text-gray-600">{t('reports.avgCatchRate')}</p>
              <p className="text-xl font-bold text-blue-700">{avgCatchProbability}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <div className="flex items-center space-x-2">
            <Fuel className="text-orange-600" size={20} />
            <div>
              <p className="text-sm text-gray-600">{t('reports.totalFuel')}</p>
              <p className="text-lg font-bold text-orange-700">{totalFuel.toFixed(1)} L</p>
            </div>
          </div>
        </div>
      </div>

      {/* Sustainability Dashboard */}
      {journeyStats && (
        <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-lg p-6 shadow-sm border border-green-200">
          <div className="flex items-center space-x-2 mb-4">
            <Leaf className="text-green-600" size={24} />
            <h2 className="text-xl font-bold text-gray-800">Eco-Friendly Journey Tracking</h2>
            <Award className="text-yellow-500" size={20} />
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="bg-white rounded-lg p-4 text-center shadow-sm">
              <MapPin className="text-blue-600 mx-auto mb-2" size={20} />
              <div className="text-2xl font-bold text-blue-600">{journeyStats.totalDistance.toFixed(1)}</div>
              <div className="text-sm text-gray-600">Total Distance (km)</div>
            </div>
            
            <div className="bg-white rounded-lg p-4 text-center shadow-sm">
              <Fuel className="text-orange-600 mx-auto mb-2" size={20} />
              <div className="text-2xl font-bold text-orange-600">{journeyStats.totalFuelSaved.toFixed(1)}</div>
              <div className="text-sm text-gray-600">Fuel Saved (L)</div>
            </div>
            
            <div className="bg-white rounded-lg p-4 text-center shadow-sm">
              <Leaf className="text-green-600 mx-auto mb-2" size={20} />
              <div className="text-2xl font-bold text-green-600">{journeyStats.carbonReduced.toFixed(1)}</div>
              <div className="text-sm text-gray-600">CO₂ Reduced (kg)</div>
            </div>
            
            <div className="bg-white rounded-lg p-4 text-center shadow-sm">
              <Award className="text-purple-600 mx-auto mb-2" size={20} />
              <div className="text-2xl font-bold text-purple-600">{journeyStats.efficientTrips}</div>
              <div className="text-sm text-gray-600">Efficient Trips</div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm">
            <h3 className="font-semibold text-gray-800 mb-3">Environmental Impact Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Total Journeys Tracked:</span>
                <span className="font-bold text-gray-900">{journeyStats.totalTrips}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Average Fuel Efficiency:</span>
                <span className="font-bold text-green-600">
                  {journeyStats.totalTrips > 0 ? Math.round((journeyStats.efficientTrips / journeyStats.totalTrips) * 100) : 0}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Environmental Score:</span>
                <span className="font-bold text-blue-600">
                  {journeyStats.carbonReduced > 10 ? 'Excellent' : journeyStats.carbonReduced > 5 ? 'Good' : 'Getting Started'} 
                  🌱
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Journeys */}
      {recentJourneys.length > 0 && (
        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">Recent Eco-Journeys</h2>
          <div className="space-y-3">
            {recentJourneys.map((journey) => (
              <div key={journey.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${journey.fuelEfficiencyScore >= 80 ? 'bg-green-500' : journey.fuelEfficiencyScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
                  <div>
                    <div className="font-medium text-gray-800">
                      {journey.distance.toFixed(1)} km • {Math.floor(journey.duration / 60)}h {journey.duration % 60}m
                    </div>
                    <div className="text-sm text-gray-600">
                      {journey.endTime ? new Date(journey.endTime).toLocaleDateString() : 'In Progress'}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-800">
                    {journey.fuelEfficiencyScore}/100
                  </div>
                  <div className="text-xs text-gray-600">
                    {journey.estimatedFuelUsed.toFixed(1)}L • {journey.carbonFootprint.toFixed(1)}kg CO₂
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Monthly Summary Table */}
      <div className="bg-white rounded-lg p-4 shadow-sm border">
        <h2 className="text-lg font-semibold mb-4 text-gray-800">{t('reports.monthlySummary')}</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 px-1 font-medium text-gray-700">{t('reports.month')}</th>
                <th className="text-center py-2 px-1 font-medium text-gray-700">{t('reports.trips')}</th>
                <th className="text-center py-2 px-1 font-medium text-gray-700">{t('reports.distance')}</th>
                <th className="text-center py-2 px-1 font-medium text-gray-700">{t('reports.catchPct')}</th>
                <th className="text-center py-2 px-1 font-medium text-gray-700">{t('reports.fuel')}</th>
              </tr>
            </thead>
            <tbody>
              {tripSummary.map((month) => (
                <tr 
                  key={month.month} 
                  className={`border-b border-gray-100 ${
                    month.month === currentMonth ? 'bg-ocean-50' : ''
                  }`}
                >
                  <td className="py-3 px-1 font-medium text-gray-800">
                    {month.month}
                    {month.month === currentMonth && (
                      <span className="ml-2 text-xs bg-ocean-600 text-white px-2 py-1 rounded-full">
                        {t('reports.current')}
                      </span>
                    )}
                  </td>
                  <td className="text-center py-3 px-1 text-gray-700">{month.trips}</td>
                  <td className="text-center py-3 px-1 text-gray-700">{month.distance.toFixed(1)}</td>
                  <td className="text-center py-3 px-1">
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                      month.catchProbability >= 85 ? 'bg-green-100 text-green-800' :
                      month.catchProbability >= 75 ? 'bg-blue-100 text-blue-800' :
                      month.catchProbability >= 60 ? 'bg-amber-100 text-amber-800' :
                      month.catchProbability > 0 ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {month.catchProbability}%
                    </span>
                  </td>
                  <td className="text-center py-3 px-1 text-gray-700">{month.fuelUsed.toFixed(1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Performance Insights */}
      <div className="bg-white rounded-lg p-4 shadow-sm border">
        <h2 className="text-lg font-semibold mb-3 text-gray-800">{t('reports.insights')}</h2>
        <div className="space-y-3">
          <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
            <TrendingUp className="text-green-600 mt-0.5" size={18} />
            <div>
              <p className="text-sm font-medium text-green-800">{t('reports.bestPerformance')}</p>
              <p className="text-sm text-green-700">
                October had the highest catch probability at 91% with 20 successful trips.
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
            <Calendar className="text-blue-600 mt-0.5" size={18} />
            <div>
              <p className="text-sm font-medium text-blue-800">{t('reports.seasonalPattern')}</p>
              <p className="text-sm text-blue-700">
                Post-monsoon season (Sep-Dec) shows consistently higher catch rates.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-3 bg-amber-50 rounded-lg">
            <Fuel className="text-amber-600 mt-0.5" size={18} />
            <div>
              <p className="text-sm font-medium text-amber-800">{t('reports.fuelEfficiency')}</p>
              <p className="text-sm text-amber-700">
                Average fuel consumption: {(totalFuel / totalTrips).toFixed(1)} L per trip.
              </p>
            </div>
          </div>
          
          {/* Sustainability Tips */}
          {journeyStats && journeyStats.totalTrips > 0 && (
            <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
              <Leaf className="text-green-600 mt-0.5" size={18} />
              <div>
                <p className="text-sm font-medium text-green-800">Eco-Friendly Fishing Tips</p>
                <p className="text-sm text-green-700">
                  Your journey tracking shows {journeyStats.carbonReduced.toFixed(1)} kg CO₂ saved! 
                  {journeyStats.carbonReduced > 5 
                    ? " Keep up the excellent environmental stewardship!" 
                    : " Try planning more efficient routes to increase your environmental impact."}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sustainability Achievement Badge */}
      {journeyStats && journeyStats.totalTrips >= 5 && (
        <div className="bg-gradient-to-r from-green-500 to-blue-500 rounded-lg p-6 text-white text-center shadow-lg">
          <Award className="mx-auto mb-2" size={32} />
          <h3 className="text-lg font-bold mb-1">Eco-Warrior Fisherman! 🌊</h3>
          <p className="text-sm opacity-90">
            You've completed {journeyStats.totalTrips} tracked journeys and saved {journeyStats.totalFuelSaved.toFixed(1)}L of fuel!
            You're making a real difference for sustainable fishing.
          </p>
        </div>
      )}
    </div>
  )
}

export default ReportsPage
