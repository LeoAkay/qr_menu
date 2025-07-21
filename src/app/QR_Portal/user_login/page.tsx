'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function UserLoginPage() {
  const router = useRouter()
  const [userName, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false);


  const handleLogin = async () => {
    setError('')
    setLoading(true)
    
    try {
      const res = await fetch('/api/QR_Panel/user/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userName, password }),
        credentials: 'include',
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Login failed')
      }

      const data = await res.json()
      localStorage.setItem('userId', data.user.id)
      localStorage.setItem('userName', data.user.userName)

      router.push('/QR_Portal/user_dashboard')
    } catch (err: any) {
      setError(err.message || 'Invalid credentials')
      console.error('Login error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLogin()
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Animated Background Circles */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-white">
        {/* Purple circles */}
        <div className="absolute top-0 left-0 w-48 h-48 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full mix-blend-multiply opacity-70 animate-blob"></div>
        <div className="absolute top-0 right-0 w-56 h-56 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-full mix-blend-multiply opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-52 h-52 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full mix-blend-multiply opacity-70 animate-blob animation-delay-4000"></div>
        
        {/* Pink circles */}
        <div className="absolute top-1/4 right-1/4 w-44 h-44 bg-gradient-to-br from-pink-300 to-pink-500 rounded-full mix-blend-multiply opacity-70 animate-blob animation-delay-1000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-40 h-40 bg-gradient-to-br from-pink-400 to-rose-400 rounded-full mix-blend-multiply opacity-70 animate-blob animation-delay-3000"></div>
        <div className="absolute bottom-0 right-0 w-60 h-60 bg-gradient-to-br from-pink-300 to-pink-500 rounded-full mix-blend-multiply opacity-70 animate-blob animation-delay-5000"></div>
      </div>

      {/* Login Form */}
      <div className="relative z-10 w-full max-w-xl mx-auto px-6">
  <h1 className="text-6xl font-bold text-center text-gray-900 mb-12">QR Menu System</h1>
  <div className="bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl p-8 shadow-2xl">
    <div className="space-y-6">
            {/* Username Input */}
            <div>
              <label className="block text-black-700 text-sm font-medium mb-2">
                Username
              </label>
              <input
                type="text"
                placeholder="Username"
                value={userName}
                onChange={(e) => setUsername(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full px-4 py-3 bg-white/80 border border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200 text-gray-800 placeholder-gray-400 transition-all"
                disabled={loading}
              />
            </div>
            
            {/* Password Input */}
            <div className="relative">
  <label className="block text-black-700 text-sm font-medium mb-2">
    Password
  </label>
  
  <div className="relative">
  <input
    type={showPassword ? 'text' : 'password'}
    placeholder="Password"
    value={password}
    onChange={(e) => setPassword(e.target.value)}
    onKeyPress={handleKeyPress}
    className="w-full px-4 py-3 pr-12 bg-white/80 border border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200 text-gray-800 placeholder-gray-400 transition-all"
    disabled={loading}
  />

  {/* Toggle Button */}
  <button
    type="button"
    onClick={() => setShowPassword(!showPassword)}
    className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700 focus:outline-none"
    tabIndex={-1}
  >
    <img
      src="/show-password-icon-18.jpg"
      alt="Toggle password visibility"
      className="w-6 h-6"
    />
  </button>
</div>


</div>

            
            {/* Sign In Button */}
            <button
              onClick={handleLogin}
              onKeyPress={handleKeyPress}
              disabled={loading || !userName || !password}
              className="w-full bg-blue-600 hover:bg-purple-700 text-white py-3 px-4 rounded-lg font-medium text-lg transition-all duration-200 disabled:bg-blue-600 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </div>
          
          {/* Error Message */}
          {error && (
            <div className="mt-6 bg-red-50/80 backdrop-blur-sm border border-red-200 text-red-600 px-4 py-3 rounded-lg text-center text-sm">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 