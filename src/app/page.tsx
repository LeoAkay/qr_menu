'use client'

import Link from 'next/link'

export default function HomePage() {
  return (
   <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
    <div className="bg-gradient-to-br from-gray-50 to-white">
        {/* Purple circles */}
        <div className="absolute top-0 left-0 w-48 h-48 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full mix-blend-multiply opacity-70 animate-blob"></div>
        <div className="absolute top-0 right-0 w-56 h-56 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-full mix-blend-multiply opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-52 h-52 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full mix-blend-multiply opacity-70 animate-blob animation-delay-4000"></div>
        
        {/* Pink circles */}
        <div className="absolute top-1/4 right-1/4 w-44 h-44 bg-gradient-to-br from-pink-300 to-pink-500 rounded-full mix-blend-multiply opacity-70 animate-blob animation-delay-1000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-40 h-40 bg-gradient-to-br from-pink-400 to-rose-400 rounded-full mix-blend-multiply opacity-70 animate-blob animation-delay-3000"></div>
        <div className="absolute bottom-0 right-0 w-60 h-60 bg-gradient-to-br from-pink-300 to-pink-500 rounded-full mix-blend-multiply opacity-70 animate-blob animation-delay-5000"></div>
      </div>
  {/* Header */}
  <header className="py-8">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">QR Menu System</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Build and share digital menus effortlessly using QR codes. Upload PDF menus or design your own with custom categories and items.
        </p>
      </div>
      <div className="mt-8 text-center">
        <Link
          href="/QR_Portal/get_started"
          className="absolute right-5 top-6 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-semibold text-lg"
        >
          Get Started
        </Link> 
        </div>
    </div>
  </header>

  {/* Main Content */}
  <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 ">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">

      {/* Restaurant Owner Login Card */}
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
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Restaurant Owner</h2>
          <p className="text-gray-600 mb-8">
            Manage your restaurant’s digital menu. Upload PDFs, organize by category, and generate QR codes for your tables.
          </p>
          <Link
            href="/QR_Portal/user_login"
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-semibold text-lg inline-block"
          >
            Login as Owner
          </Link>
        </div>
      </div>

      {/* System Admin Login Card */}
      <div className="bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl p-8 shadow-2xl">
        <div className="text-center">
          <div className="w-16 h-16 bg-pink-300 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-3xl">⚙️</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">System Admin</h2>
          <p className="text-gray-600 mb-8">
            Oversee restaurants on the platform. Create new accounts and manage user access.
          </p>
          <Link
            href="/admin_login"
            className="mt-6 w-full bg-purple-600 text-white py-3 px-6 rounded-lg hover:bg-purple-700 transition-colors font-semibold text-lg inline-block"
          >
            Login as Admin
          </Link>
        </div>
      </div>
    </div>

    {/* How It Works Section */}
    <div className="mt-16 text-center ">
      <h2 className="text-3xl font-bold text-gray-900 mb-8">How It Works</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
        <div>
          <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">1️⃣</span>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Create Account</h3>
          <p className="text-gray-600">Contact us to get your restaurant account set up.</p>
        </div>
        <div>
          <div className="w-12 h-12 bg-purple-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">2️⃣</span>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Upload Menu</h3>
          <p className="text-gray-600">Add your menu as a PDF or create a custom digital menu with categories and items.</p>
        </div>
        <div>
          <div className="w-12 h-12 bg-pink-300 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">3️⃣</span>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Generate QR</h3>
          <p className="text-gray-600">Download or upload a unique QR code for your restaurant tables.</p>
        </div>
      </div>

      {/* Features List */}
      <div className="mt-12 pt-8  text-center">
  <h3 className="font-semibold text-black-900 mb-4 text-2xl">Features</h3>
  <ul className="space-y-4 text-xl text-black-600 flex flex-col items-center">
    <li className="flex items-center">
      <span className="w-2 h-2 bg-purple-600 rounded-full mr-3"></span>
      <span>Upload PDF menus or create interactive menus manually</span>
    </li>
    <li className="flex items-center">
      <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
      <span>Customize menu appearance with themes and colors</span>
    </li>
    <li className="flex items-center">
      <span className="w-2 h-2 bg-pink-400 rounded-full mr-3"></span>
      <span>Generate downloadable QR codes</span>
    </li>
    <li className="flex items-center">
      <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
      <span>Real-time menu preview</span>
    </li>
  </ul>
</div>

    </div>
  </main>

  {/* Footer */}
  <footer className="py-12  mt-16">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center text-gray-600">
        <p>© 2024 QR Menu System. Digital menus made simple.</p>
      </div>
    </div>
  </footer>
</div>
  )
}
