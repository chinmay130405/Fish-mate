import { User, Anchor, Phone, Globe, BarChart3, Settings, Award, MapPin } from 'lucide-react'
import { userProfile } from '../data/dummyData'
import { useTranslation } from 'react-i18next'

const ProfilePage = () => {
  const { t } = useTranslation()
  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="bg-white rounded-lg p-4 shadow-sm border">
        <h1 className="text-xl font-bold text-gray-800 mb-2">{t('profile.header')}</h1>
        <p className="text-gray-600">{t('profile.subheader')}</p>
      </div>

      {/* Profile Card */}
      <div className="bg-gradient-to-br from-ocean-500 to-ocean-600 rounded-lg p-6 text-white shadow-lg">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
            <User size={32} className="text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold">{userProfile.name}</h2>
            <p className="text-ocean-100">{t('profile.header')}</p>
            <div className="flex items-center space-x-4 mt-2 text-sm">
              <span className="flex items-center space-x-1">
                <Anchor size={14} />
                <span>{userProfile.boatId}</span>
              </span>
              <span className="flex items-center space-x-1">
                <Award size={14} />
                <span>{userProfile.totalTrips} trips</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Personal Information */}
      <div className="bg-white rounded-lg p-4 shadow-sm border">
        <h2 className="text-lg font-semibold mb-4 text-gray-800">{t('profile.personalInfo')}</h2>
        <div className="space-y-3">
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <User className="text-gray-600" size={20} />
            <div>
              <p className="text-sm text-gray-600">{t('profile.fullName')}</p>
              <p className="font-medium text-gray-800">{userProfile.name}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <Phone className="text-gray-600" size={20} />
            <div>
              <p className="text-sm text-gray-600">{t('profile.phoneNumber')}</p>
              <p className="font-medium text-gray-800">{userProfile.phone}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <Globe className="text-gray-600" size={20} />
            <div>
              <p className="text-sm text-gray-600">{t('profile.language')}</p>
              <p className="font-medium text-gray-800">{userProfile.language}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Boat & License Information */}
      <div className="bg-white rounded-lg p-4 shadow-sm border">
        <h2 className="text-lg font-semibold mb-4 text-gray-800">{t('profile.boatLicense')}</h2>
        <div className="space-y-3">
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <Anchor className="text-gray-600" size={20} />
            <div>
              <p className="text-sm text-gray-600">{t('profile.boatId')}</p>
              <p className="font-medium text-gray-800">{userProfile.boatId}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <Award className="text-gray-600" size={20} />
            <div>
              <p className="text-sm text-gray-600">{t('profile.license')}</p>
              <p className="font-medium text-gray-800">{userProfile.licenseNumber}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Fishing Statistics */}
      <div className="bg-white rounded-lg p-4 shadow-sm border">
        <h2 className="text-lg font-semibold mb-4 text-gray-800">{t('profile.stats')}</h2>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-ocean-50 rounded-lg p-4 text-center">
            <BarChart3 className="mx-auto text-ocean-600 mb-2" size={24} />
            <p className="text-2xl font-bold text-ocean-700">{userProfile.totalTrips}</p>
            <p className="text-sm text-ocean-600">{t('profile.totalTrips')}</p>
          </div>

          <div className="bg-green-50 rounded-lg p-4 text-center">
            <Award className="mx-auto text-green-600 mb-2" size={24} />
            <p className="text-2xl font-bold text-green-700">{userProfile.avgCatch} kg</p>
            <p className="text-sm text-green-600">{t('profile.avgCatch')}</p>
          </div>

          <div className="bg-blue-50 rounded-lg p-4 text-center">
            <MapPin className="mx-auto text-blue-600 mb-2" size={24} />
            <p className="text-2xl font-bold text-blue-700">Mumbai</p>
            <p className="text-sm text-blue-600">{t('profile.homePort')}</p>
          </div>

          <div className="bg-amber-50 rounded-lg p-4 text-center">
            <Settings className="mx-auto text-amber-600 mb-2" size={24} />
            <p className="text-2xl font-bold text-amber-700">Active</p>
            <p className="text-sm text-amber-600">{t('profile.status')}</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg p-4 shadow-sm border">
        <h2 className="text-lg font-semibold mb-4 text-gray-800">{t('profile.quickActions')}</h2>
        <div className="space-y-3">
          <button className="w-full flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <Settings className="text-gray-600" size={20} />
            <span className="font-medium text-gray-800">{t('profile.accountSettings')}</span>
          </button>

          <button className="w-full flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <Globe className="text-gray-600" size={20} />
            <span className="font-medium text-gray-800">{t('profile.changeLanguage')}</span>
          </button>

          <button className="w-full flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <Phone className="text-gray-600" size={20} />
            <span className="font-medium text-gray-800">{t('profile.supportHelp')}</span>
          </button>

          <button className="w-full flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <Award className="text-gray-600" size={20} />
            <span className="font-medium text-gray-800">{t('profile.licenseRenewal')}</span>
          </button>
        </div>
      </div>

      {/* App Version */}
        <div className="text-center text-sm text-gray-500 pt-4">
          <p>{t('profile.footerLine1')}</p>
          <p>{t('profile.footerLine2')}</p>
      </div>
    </div>
  )
}

export default ProfilePage
