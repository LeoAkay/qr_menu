'use client'

import { useI18n } from '../i18n/I18nContext'
import { Globe } from 'lucide-react'

export default function LanguageSwitcher() {
  const { locale, setLocale, t } = useI18n()

  const toggleLanguage = () => {
    setLocale(locale === 'en' ? 'tr' : 'en')
  }

  return (
    <button
      onClick={toggleLanguage}
      className="fixed top-4 right-4 z-50 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-white hover:border-gray-300 transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-2"
      title={t('language.switch')}
    >
      <Globe className="w-4 h-4" />
      <span className="hidden sm:inline">{locale === 'en' ? 'EN' : 'TR'}</span>
    </button>
  )
}
