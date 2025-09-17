import { Calendar, TrendingUp, Fuel, Target } from 'lucide-react'
import { tripSummary } from '../data/dummyData'

const ReportsPage = () => {
  const totalTrips = tripSummary.reduce((sum, month) => sum + month.trips, 0)
  const totalDistance = tripSummary.reduce((sum, month) => sum + month.distance, 0)
  const avgCatchProbability = Math.round(
    tripSummary.reduce((sum, month) => sum + month.catchProbability, 0) / tripSummary.length
  )
  const totalFuel = tripSummary.reduce((sum, month) => sum + month.fuelUsed, 0)

  const currentDate = new Date()
  const currentMonth = currentDate.toLocaleString('default', { month: 'long' })

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="bg-white rounded-lg p-4 shadow-sm border">
        <h1 className="text-xl font-bold text-gray-800 mb-2">Monthly Reports</h1>
        <p className="text-gray-600">Track your fishing trip performance and statistics</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <div className="flex items-center space-x-2">
            <Calendar className="text-ocean-600" size={20} />
            <div>
              <p className="text-sm text-gray-600">Total Trips</p>
              <p className="text-xl font-bold text-ocean-700">{totalTrips}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <div className="flex items-center space-x-2">
            <TrendingUp className="text-green-600" size={20} />
            <div>
              <p className="text-sm text-gray-600">Total Distance</p>
              <p className="text-lg font-bold text-green-700">{totalDistance.toFixed(1)} km</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <div className="flex items-center space-x-2">
            <Target className="text-blue-600" size={20} />
            <div>
              <p className="text-sm text-gray-600">Avg Catch Rate</p>
              <p className="text-xl font-bold text-blue-700">{avgCatchProbability}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <div className="flex items-center space-x-2">
            <Fuel className="text-orange-600" size={20} />
            <div>
              <p className="text-sm text-gray-600">Total Fuel</p>
              <p className="text-lg font-bold text-orange-700">{totalFuel.toFixed(1)} L</p>
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Summary Table */}
      <div className="bg-white rounded-lg p-4 shadow-sm border">
        <h2 className="text-lg font-semibold mb-4 text-gray-800">Monthly Summary</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 px-1 font-medium text-gray-700">Month</th>
                <th className="text-center py-2 px-1 font-medium text-gray-700">Trips</th>
                <th className="text-center py-2 px-1 font-medium text-gray-700">Distance</th>
                <th className="text-center py-2 px-1 font-medium text-gray-700">Catch %</th>
                <th className="text-center py-2 px-1 font-medium text-gray-700">Fuel (L)</th>
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
                        Current
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
        <h2 className="text-lg font-semibold mb-3 text-gray-800">Performance Insights</h2>
        <div className="space-y-3">
          <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
            <TrendingUp className="text-green-600 mt-0.5" size={18} />
            <div>
              <p className="text-sm font-medium text-green-800">Best Performance</p>
              <p className="text-sm text-green-700">
                October had the highest catch probability at 91% with 20 successful trips.
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
            <Calendar className="text-blue-600 mt-0.5" size={18} />
            <div>
              <p className="text-sm font-medium text-blue-800">Seasonal Pattern</p>
              <p className="text-sm text-blue-700">
                Post-monsoon season (Sep-Dec) shows consistently higher catch rates.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-3 bg-amber-50 rounded-lg">
            <Fuel className="text-amber-600 mt-0.5" size={18} />
            <div>
              <p className="text-sm font-medium text-amber-800">Fuel Efficiency</p>
              <p className="text-sm text-amber-700">
                Average fuel consumption: {(totalFuel / totalTrips).toFixed(1)} L per trip.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ReportsPage
