import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

const LanguageSwitcher = () => {
  const { i18n, t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const languages = [
    { code: 'en', name: t('languages.english'), native: 'English' },
    { code: 'hi', name: t('languages.hindi'), native: 'हिंदी' },
    { code: 'ta', name: t('languages.tamil'), native: 'தமிழ்' },
    { code: 'te', name: t('languages.telugu'), native: 'తెలుగు' },
    { code: 'kn', name: t('languages.kannada'), native: 'ಕನ್ನಡ' },
    { code: 'ml', name: t('languages.malayalam'), native: 'മലയാളം' },
    { code: 'gu', name: t('languages.gujarati'), native: 'ગુજરાતી' },
    { code: 'bn', name: t('languages.bengali'), native: 'বাংলা' },
    { code: 'mr', name: t('languages.marathi'), native: 'मराठी' },
    { code: 'kok', name: t('languages.konkani'), native: 'कोंकणी' },
  ];

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  const changeLanguage = (langCode: string) => {
    i18n.changeLanguage(langCode);
    localStorage.setItem('language', langCode);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-white shadow-sm border hover:bg-gray-50 transition-colors"
      >
        <Globe size={18} className="text-blue-600" />
        <span className="text-sm font-medium text-gray-700">
          {currentLanguage.native}
        </span>
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded-lg shadow-lg border z-20 max-h-64 overflow-y-auto">
            {languages.map((language) => (
              <button
                key={language.code}
                onClick={() => changeLanguage(language.code)}
                className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 ${
                  i18n.language === language.code ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                }`}
              >
                <div className="flex flex-col">
                  <span className="font-medium">{language.native}</span>
                  <span className="text-xs text-gray-500">{language.name}</span>
                </div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default LanguageSwitcher;