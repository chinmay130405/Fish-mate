export type Language = 'en' | 'hi' | 'ta' | 'te' | 'kn' | 'ml' | 'gu' | 'bn';

export interface TranslationKeys {
  // Navigation
  'nav.home': string;
  'nav.reports': string;
  'nav.alerts': string;
  'nav.profile': string;
  'nav.map': string;
  'nav.weather': string;

  // HomePage
  'home.title': string;
  'home.pfzZones': string;
  'home.weatherStatus': string;
  'home.boundaryStatus': string;
  'home.activeAlerts': string;
  'home.gpsLocation': string;
  'home.fishingZoneMap': string;
  'home.yourLocation': string;
  'home.latitude': string;
  'home.longitude': string;
  'home.accuracy': string;
  'home.lastUpdate': string;
  'home.enableLocation': string;
  'home.gettingLocation': string;
  'home.highDensity': string;
  'home.mediumDensity': string;
  'home.lowDensity': string;
  'home.checking': string;
  'home.safe': string;
  'home.unsafe': string;
  'home.safeToFish': string;
  'home.unsafeToFish': string;
  'home.wind': string;
  'home.waves': string;
  'home.clusterDetails': string;
  'home.fishDensity': string;
  'home.avgDepth': string;
  'home.count': string;

  // Fish Prediction
  'fish.title': string;
  'fish.selectImage': string;
  'fish.dragDrop': string;
  'fish.predicting': string;
  'fish.results': string;
  'fish.confidence': string;
  'fish.topPredictions': string;
  'fish.uploadAnother': string;

  // Weather Status
  'weather.safe': string;
  'weather.unsafe': string;
  'weather.moderate': string;
  'weather.checking': string;
  'weather.tapForDetails': string;

  // Alerts
  'alerts.title': string;
  'alerts.active': string;
  'alerts.recent': string;
  'alerts.weatherAlert': string;
  'alerts.boundaryAlert': string;
  'alerts.seasonalAlert': string;
  'alerts.geofenceAlert': string;
  'alerts.noActiveAlerts': string;
  'alerts.viewAll': string;

  // Profile
  'profile.title': string;
  'profile.name': string;
  'profile.phone': string;
  'profile.email': string;
  'profile.location': string;
  'profile.experience': string;
  'profile.language': string;
  'profile.notifications': string;
  'profile.settings': string;
  'profile.logout': string;

  // Reports
  'reports.title': string;
  'reports.monthlyTrips': string;
  'reports.totalCatch': string;
  'reports.avgDepth': string;
  'reports.fuelUsed': string;
  'reports.revenue': string;
  'reports.viewDetails': string;

  // Common
  'common.yes': string;
  'common.no': string;
  'common.ok': string;
  'common.cancel': string;
  'common.save': string;
  'common.close': string;
  'common.loading': string;
  'common.error': string;
  'common.success': string;
  'common.search': string;
  'common.filter': string;
  'common.sort': string;
  'common.location': string;
  'common.date': string;
  'common.time': string;

  // Language names
  'lang.english': string;
  'lang.hindi': string;
  'lang.tamil': string;
  'lang.telugu': string;
  'lang.kannada': string;
  'lang.malayalam': string;
  'lang.gujarati': string;
  'lang.bengali': string;
}

export type Translations = Record<Language, TranslationKeys>;