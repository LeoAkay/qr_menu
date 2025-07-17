'use client'

import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl font-bold text-gray-900 mb-4">
              QR Menu System
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Create beautiful digital menus with QR codes. Upload PDF menus or build custom menus with categories and items.
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          
          {/* User Login Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300 border border-gray-100">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">👤</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Restaurant Owner</h2>
              <p className="text-gray-600 mb-8">
                Manage your restaurant menu, upload PDFs, create categories, and generate QR codes for your customers.
              </p>
              <Link
                href="/QR_Portal/user_login"
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-semibold text-lg inline-block"
              >
                Login as User
              </Link>
            </div>
            
            <div className="mt-8 pt-8 border-t border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-3">Features:</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                  Upload PDF menus or create manual menus
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                  Customize themes and colors
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                  Generate downloadable QR codes
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                  Live menu preview
                </li>
              </ul>
            </div>
          </div>

          {/* Admin Login Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300 border border-gray-100">
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">⚙️</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">System Admin</h2>
              <p className="text-gray-600 mb-8">
                Manage users and companies in the system. Create new restaurant accounts and oversee the platform.
              </p>
              <Link
                href="/admin_login"
                className="w-full bg-purple-600 text-white py-3 px-6 rounded-lg hover:bg-purple-700 transition-colors font-semibold text-lg inline-block"
              >
                Login as Admin
              </Link>
            </div>
            
            <div className="mt-8 pt-8 border-t border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-3">Admin Features:</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
                  Create and manage user accounts
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
                  Manage company profiles
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
                  View all registered restaurants
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
                  System administration
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Demo Section */}
        <div className="mt-16 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">1️⃣</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Create Account</h3>
              <p className="text-gray-600">Admin creates your restaurant account</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">2️⃣</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Upload Menu</h3>
              <p className="text-gray-600">Upload PDF or create manual menu</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">3️⃣</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Generate QR</h3>
              <p className="text-gray-600">Download QR code for your tables</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-12 border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-gray-600">
            <p>© 2024 QR Menu System. Digital menus made simple.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
