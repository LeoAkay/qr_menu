'use client'

import Link from 'next/link'
import { Upload, Paintbrush, QrCode, Eye, Globe } from 'lucide-react'
import { useI18n } from './i18n/I18nContext'


export default function HomePage() {
  const { t, locale, setLocale } = useI18n()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 relative overflow-hidden">
      
      {/* Animated Blobs */}
      <div className="absolute top-0 left-0 w-48 h-48 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full mix-blend-multiply opacity-70 animate-blob"></div>
      <div className="absolute top-0 right-0 w-56 h-56 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-full mix-blend-multiply opacity-70 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-20 w-52 h-52 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full mix-blend-multiply opacity-70 animate-blob animation-delay-4000"></div>
      <div className="absolute top-1/4 right-1/4 w-44 h-44 bg-gradient-to-br from-pink-300 to-pink-500 rounded-full mix-blend-multiply opacity-70 animate-blob animation-delay-1000"></div>
      <div className="absolute bottom-1/4 left-1/3 w-40 h-40 bg-gradient-to-br from-pink-400 to-rose-400 rounded-full mix-blend-multiply opacity-70 animate-blob animation-delay-3000"></div>
      <div className="absolute bottom-0 right-0 w-60 h-60 bg-gradient-to-br from-pink-300 to-pink-500 rounded-full mix-blend-multiply opacity-70 animate-blob animation-delay-5000"></div>

      {/* Header */}
       <header className="py-8">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="flex justify-between items-center mb-8">
      <div className="flex-1"></div>
      <div className="flex-1 text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">{t('main.title')}</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          {t('main.subtitle')}
        </p>
      </div>
             <div className="flex-1 flex justify-end">
         <button
           onClick={() => setLocale(locale === 'en' ? 'tr' : 'en')}
           className="fixed top-4 right-4 z-50 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-white hover:border-gray-300 transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-2"
           title={t('language.switch')}
         >
           <Globe className="w-4 h-4" />
           <span className="hidden sm:inline">{locale === 'en' ? 'EN' : 'TR'}</span>
         </button>
       </div>
    </div>
    <div className="text-center">
      <Link
        href="/QR_Portal/get_started"
        className="inline-block bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-semibold text-lg"
      >
        {t('main.getStarted')}
      </Link> 
    </div>
  </div>
</header>


      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Login Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Restaurant Owner */}
          <div className="bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl p-8 shadow-2xl">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-3xl ">
              <img
                src="/user-icon-on-transparent-background-free-png.webp"
                alt="User Icon"
                className="mx-auto"
              />
            </span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('main.restaurantOwner.title')}</h2>
          <p className="text-gray-600 mb-8">
            {t('main.restaurantOwner.description')}
          </p>
          <Link
            href="/QR_Portal/user_login"
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-semibold text-lg inline-block"
          >
            {t('main.restaurantOwner.login')}
          </Link>
        </div>
      </div>

          {/* Admin */}
          <div className="bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl p-8 shadow-2xl">
        <div className="text-center">
          <div className="w-16 h-16 bg-pink-300 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-3xl">⚙️</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('main.admin.title')}</h2>
          <p className="text-gray-600 mb-8">
            {t('main.admin.description')}
          </p>
          <Link
            href="/admin_login"
            className="mt-6 w-full bg-purple-600 text-white py-3 px-6 rounded-lg hover:bg-purple-700 transition-colors font-semibold text-lg inline-block"
          >
            {t('main.admin.login')}
          </Link>
        </div>
      </div>
    </div>
        {/* How It Works */}
        <div className="mt-16 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">{t('main.howItWorks.title')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { step: '1️⃣', title: t('main.howItWorks.step1.title'), desc: t('main.howItWorks.step1.desc'), color:'bg-blue-600'},
              { step: '2️⃣', title: t('main.howItWorks.step2.title'), desc: t('main.howItWorks.step2.desc'), color:'bg-pink-400' },
              { step: '3️⃣', title: t('main.howItWorks.step3.title'), desc: t('main.howItWorks.step3.desc'), color:'bg-purple-600' },
            ].map((item, i) => (
              <div key={i}>
                <div className={`w-12 h-12 ${item.color} rounded-full flex items-center justify-center mx-auto mb-4 text-white text-2xl`}>
  {item.step}
</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Features */}
        <div className="mt-20 text-center">
          <h3 className="text-3xl font-bold text-gray-900 mb-10">{t('main.features.title')}</h3>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto text-left">
            <FeatureCard icon={<Upload className="text-purple-600 w-6 h-6 " />} title={t('main.features.upload.title')} description={t('main.features.upload.description')} />
            <FeatureCard icon={<Paintbrush className="text-blue-600 w-6 h-6" />} title={t('main.features.customize.title')} description={t('main.features.customize.description')} />
            <FeatureCard icon={<QrCode className="text-pink-500 w-6 h-6" />} title={t('main.features.qr.title')} description={t('main.features.qr.description')} />
            <FeatureCard icon={<Eye className="text-blue-500 w-6 h-6" />} title={t('main.features.preview.title')} description={t('main.features.preview.description')} />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-100 py-12 mt-20 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-700 text-sm">{t('main.footer.copyright')}</p>
          <p className="text-gray-500 mt-2">{t('main.footer.description')}</p>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition flex gap-4 items-start">
      <div>{icon}</div>
      <div>
        <h4 className="font-semibold text-lg mb-1">{title}</h4>
        <p className="text-gray-600 text-sm">{description}</p>
      </div>
    </div>
  )
}
