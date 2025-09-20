interface JourneyData {
  id: string
  startTime: Date
  endTime?: Date
  startLocation?: { latitude: number; longitude: number }
  endLocation?: { latitude: number; longitude: number }
  distance: number
  duration: number // in minutes
  estimatedFuelUsed: number
  route: { latitude: number; longitude: number; timestamp: Date }[]
  isActive: boolean
  carbonFootprint: number // kg CO2
  fuelEfficiencyScore: number // 1-100
}

interface JourneyStats {
  totalDistance: number
  totalFuelSaved: number
  carbonReduced: number
  efficientTrips: number
  totalTrips: number
}

class JourneyTrackingService {
  private currentJourney: JourneyData | null = null
  private journeyHistory: JourneyData[] = []
  private trackingInterval: number | null = null
  private readonly TRACKING_INTERVAL = 10000 // Track every 10 seconds
  private readonly FUEL_CONSUMPTION_RATE = 0.25 // L/km (average for fishing boats)
  private readonly CO2_PER_LITER = 2.68 // kg CO2 per liter of fuel

  constructor() {
    this.loadJourneyHistory()
  }

  startJourney(location?: { latitude: number; longitude: number }): string {
    if (this.currentJourney && this.currentJourney.isActive) {
      throw new Error('A journey is already in progress')
    }

    const journeyId = `journey_${Date.now()}`
    this.currentJourney = {
      id: journeyId,
      startTime: new Date(),
      startLocation: location,
      distance: 0,
      duration: 0,
      estimatedFuelUsed: 0,
      route: location ? [{ ...location, timestamp: new Date() }] : [],
      isActive: true,
      carbonFootprint: 0,
      fuelEfficiencyScore: 100
    }

    this.startTracking()
    this.saveJourneyHistory()
    return journeyId
  }

  stopJourney(location?: { latitude: number; longitude: number }): JourneyData | null {
    if (!this.currentJourney || !this.currentJourney.isActive) {
      return null
    }

    this.stopTracking()

    this.currentJourney.endTime = new Date()
    this.currentJourney.endLocation = location
    this.currentJourney.isActive = false
    this.currentJourney.duration = Math.round(
      (this.currentJourney.endTime.getTime() - this.currentJourney.startTime.getTime()) / (1000 * 60)
    )

    if (location) {
      this.currentJourney.route.push({ ...location, timestamp: new Date() })
    }

    // Calculate final metrics
    this.calculateJourneyMetrics()

    // Save to history
    this.journeyHistory.push({ ...this.currentJourney })
    this.saveJourneyHistory()

    const completedJourney = { ...this.currentJourney }
    this.currentJourney = null
    return completedJourney
  }

  getCurrentJourney(): JourneyData | null {
    return this.currentJourney
  }

  getJourneyHistory(): JourneyData[] {
    // Ensure dates are properly converted when returning data
    return [...this.journeyHistory].map(journey => ({
      ...journey,
      startTime: journey.startTime instanceof Date ? journey.startTime : new Date(journey.startTime),
      endTime: journey.endTime ? (journey.endTime instanceof Date ? journey.endTime : new Date(journey.endTime)) : undefined,
      route: journey.route.map(point => ({
        ...point,
        timestamp: point.timestamp instanceof Date ? point.timestamp : new Date(point.timestamp)
      }))
    })).reverse() // Most recent first
  }

  getJourneyStats(): JourneyStats {
    const completedJourneys = this.journeyHistory.filter(j => !j.isActive)
    
    const totalDistance = completedJourneys.reduce((sum, j) => sum + j.distance, 0)
    const totalFuelUsed = completedJourneys.reduce((sum, j) => sum + j.estimatedFuelUsed, 0)
    const standardFuelConsumption = totalDistance * this.FUEL_CONSUMPTION_RATE
    const totalFuelSaved = Math.max(0, standardFuelConsumption - totalFuelUsed)
    const carbonReduced = totalFuelSaved * this.CO2_PER_LITER
    const efficientTrips = completedJourneys.filter(j => j.fuelEfficiencyScore >= 80).length

    return {
      totalDistance,
      totalFuelSaved,
      carbonReduced,
      efficientTrips,
      totalTrips: completedJourneys.length
    }
  }

  private startTracking(): void {
    if (this.trackingInterval) {
      clearInterval(this.trackingInterval)
    }

    this.trackingInterval = setInterval(() => {
      this.updateJourneyTracking()
    }, this.TRACKING_INTERVAL)
  }

  private stopTracking(): void {
    if (this.trackingInterval) {
      clearInterval(this.trackingInterval)
      this.trackingInterval = null
    }
  }

  private updateJourneyTracking(): void {
    if (!this.currentJourney || !this.currentJourney.isActive) return

    // In a real app, this would get the current GPS location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const currentLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            timestamp: new Date()
          }

          if (this.currentJourney) {
            this.currentJourney.route.push(currentLocation)
            this.calculateDistance()
            this.calculateDuration()
            this.calculateFuelUsage()
            this.saveJourneyHistory()
          }
        },
        (error) => {
          console.log('GPS tracking error:', error)
        }
      )
    }
  }

  private calculateDistance(): void {
    if (!this.currentJourney || this.currentJourney.route.length < 2) return

    let totalDistance = 0
    for (let i = 1; i < this.currentJourney.route.length; i++) {
      const prev = this.currentJourney.route[i - 1]
      const curr = this.currentJourney.route[i]
      totalDistance += this.haversineDistance(prev, curr)
    }

    this.currentJourney.distance = totalDistance
  }

  private calculateDuration(): void {
    if (!this.currentJourney) return

    const now = new Date()
    this.currentJourney.duration = Math.round(
      (now.getTime() - this.currentJourney.startTime.getTime()) / (1000 * 60)
    )
  }

  private calculateFuelUsage(): void {
    if (!this.currentJourney) return

    // Basic fuel calculation - in a real app this would consider boat efficiency, speed, weather conditions
    const baseFuelConsumption = this.currentJourney.distance * this.FUEL_CONSUMPTION_RATE
    
    // Efficiency factors (would be more complex in reality)
    let efficiencyMultiplier = 1.0
    
    // Reward shorter, more direct routes
    if (this.currentJourney.duration > 0) {
      const avgSpeed = this.currentJourney.distance / (this.currentJourney.duration / 60) // km/h
      if (avgSpeed > 15 && avgSpeed < 25) { // Optimal speed range for fishing boats
        efficiencyMultiplier = 0.9
      }
    }

    this.currentJourney.estimatedFuelUsed = baseFuelConsumption * efficiencyMultiplier
    this.currentJourney.carbonFootprint = this.currentJourney.estimatedFuelUsed * this.CO2_PER_LITER
  }

  private calculateJourneyMetrics(): void {
    if (!this.currentJourney) return

    // Calculate fuel efficiency score (1-100)
    const standardFuelForDistance = this.currentJourney.distance * this.FUEL_CONSUMPTION_RATE
    const actualFuelUsed = this.currentJourney.estimatedFuelUsed
    
    if (standardFuelForDistance > 0) {
      this.currentJourney.fuelEfficiencyScore = Math.min(100, Math.max(0, Math.round(100 - (actualFuelUsed / standardFuelForDistance) * 100)))
    }
  }

  private haversineDistance(point1: { latitude: number; longitude: number }, point2: { latitude: number; longitude: number }): number {
    const R = 6371 // Earth's radius in kilometers
    const dLat = this.toRadians(point2.latitude - point1.latitude)
    const dLon = this.toRadians(point2.longitude - point1.longitude)
    const lat1 = this.toRadians(point1.latitude)
    const lat2 = this.toRadians(point2.latitude)

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180)
  }

  private saveJourneyHistory(): void {
    try {
      const data = {
        currentJourney: this.currentJourney,
        journeyHistory: this.journeyHistory
      }
      localStorage.setItem('fishmate_journey_data', JSON.stringify(data))
    } catch (error) {
      console.error('Failed to save journey data:', error)
    }
  }

  private loadJourneyHistory(): void {
    try {
      const saved = localStorage.getItem('fishmate_journey_data')
      if (saved) {
        const data = JSON.parse(saved)
        
        // Deserialize dates in journey history
        this.journeyHistory = (data.journeyHistory || []).map((journey: any) => ({
          ...journey,
          startTime: new Date(journey.startTime),
          endTime: journey.endTime ? new Date(journey.endTime) : undefined,
          route: journey.route.map((point: any) => ({
            ...point,
            timestamp: new Date(point.timestamp)
          }))
        }))
        
        // If there was an active journey, mark it as incomplete
        if (data.currentJourney && data.currentJourney.isActive) {
          const currentJourney = {
            ...data.currentJourney,
            startTime: new Date(data.currentJourney.startTime),
            endTime: new Date(),
            isActive: false,
            route: data.currentJourney.route.map((point: any) => ({
              ...point,
              timestamp: new Date(point.timestamp)
            }))
          }
          this.journeyHistory.push(currentJourney)
        }
      }
    } catch (error) {
      console.error('Failed to load journey data:', error)
      this.journeyHistory = []
    }
  }
}

export const journeyTrackingService = new JourneyTrackingService()
export type { JourneyData, JourneyStats }