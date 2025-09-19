export type FishingSafetyStatus = 'Safe' | 'Caution' | 'Unsafe'

export interface WeatherConditions {
  windSpeedMetersPerSecond: number | null
  waveHeightMeters: number | null
  precipitationMmPerHour: number | null
  observationTimeIso: string | null
}

export interface FishingSafetyResult {
  status: FishingSafetyStatus
  reasons: string[]
  conditions: WeatherConditions
}

async function fetchJson(url: string) {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Weather request failed: ${response.status}`)
  }
  return response.json()
}

function selectCurrentIndex(timeArray: string[]): number {
  const now = new Date()
  let nearestIndex = 0
  let nearestDiff = Number.POSITIVE_INFINITY
  for (let i = 0; i < timeArray.length; i++) {
    const t = new Date(timeArray[i])
    const diff = Math.abs(t.getTime() - now.getTime())
    if (diff < nearestDiff) {
      nearestDiff = diff
      nearestIndex = i
    }
  }
  return nearestIndex
}

function computeSafety(conditions: WeatherConditions): FishingSafetyResult {
  const reasons: string[] = []
  let score = 0

  // Thresholds based on small craft advisories and common fishing heuristics
  // Wind: < 6 m/s ideal, 6-10 caution, > 10 unsafe
  const wind = conditions.windSpeedMetersPerSecond
  if (wind != null) {
    if (wind <= 6) {
      score += 2
    } else if (wind <= 10) {
      reasons.push(`Moderate wind ${wind.toFixed(1)} m/s`)
      score += 1
    } else {
      reasons.push(`High wind ${wind.toFixed(1)} m/s`)
      score -= 2
    }
  } else {
    reasons.push('Wind data unavailable')
  }

  // Waves: < 1.0 m ideal, 1.0-1.8 caution, > 1.8 unsafe
  const wave = conditions.waveHeightMeters
  if (wave != null) {
    if (wave <= 1.0) {
      score += 2
    } else if (wave <= 1.8) {
      reasons.push(`Moderate waves ${wave.toFixed(1)} m`)
      score += 0
    } else {
      reasons.push(`Rough seas ${wave.toFixed(1)} m`)
      score -= 2
    }
  } else {
    reasons.push('Wave data unavailable')
  }

  // Precipitation: < 0.5 mm/h ideal, 0.5-2 caution, > 2 unsafe
  const precip = conditions.precipitationMmPerHour
  if (precip != null) {
    if (precip <= 0.5) {
      score += 1
    } else if (precip <= 2) {
      reasons.push(`Light rain ${precip.toFixed(1)} mm/h`)
      score += 0
    } else {
      reasons.push(`Heavy rain ${precip.toFixed(1)} mm/h`)
      score -= 1
    }
  }

  let status: FishingSafetyStatus = 'Caution'
  if (score >= 3) status = 'Safe'
  else if (score <= -1) status = 'Unsafe'

  return { status, reasons, conditions }
}

export const weatherService = {
  async getFishingSafety(latitude: number, longitude: number): Promise<FishingSafetyResult> {
    // Build URLs (no API key required)
    const marineUrl = `https://marine-api.open-meteo.com/v1/marine?latitude=${latitude}&longitude=${longitude}&hourly=wave_height&timezone=auto`
    const meteoUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=wind_speed_10m,precipitation&timezone=auto`

    const [marine, meteo] = await Promise.all([
      fetchJson(marineUrl).catch(() => null),
      fetchJson(meteoUrl).catch(() => null)
    ])

    let waveHeight: number | null = null
    let windSpeed: number | null = null
    let precipitation: number | null = null
    let timeIso: string | null = null

    if (marine && marine.hourly && Array.isArray(marine.hourly.time)) {
      const idx = selectCurrentIndex(marine.hourly.time)
      waveHeight = typeof marine.hourly.wave_height?.[idx] === 'number' ? marine.hourly.wave_height[idx] : null
      timeIso = marine.hourly.time[idx] ?? null
    }

    if (meteo && meteo.hourly && Array.isArray(meteo.hourly.time)) {
      const idx = selectCurrentIndex(meteo.hourly.time)
      windSpeed = typeof meteo.hourly.wind_speed_10m?.[idx] === 'number' ? meteo.hourly.wind_speed_10m[idx] : null
      precipitation = typeof meteo.hourly.precipitation?.[idx] === 'number' ? meteo.hourly.precipitation[idx] : null
      if (!timeIso) timeIso = meteo.hourly.time[idx] ?? null
    }

    const conditions: WeatherConditions = {
      windSpeedMetersPerSecond: windSpeed,
      waveHeightMeters: waveHeight,
      precipitationMmPerHour: precipitation,
      observationTimeIso: timeIso
    }

    return computeSafety(conditions)
  }
} 