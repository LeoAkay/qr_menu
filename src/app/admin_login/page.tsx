'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
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
      const res = await fetch('/api/AdminPanel/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userName, password }),
        credentials: 'include',
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData.error || 'Login failed')
      }

      const data = await res.json()
      localStorage.setItem('adminId', data.admin.id);
      localStorage.setItem('User_Name', data.admin.userName);

      router.push('/admin_login/view_companies')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid credentials')
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
    <main className="flex items-center justify-center min-h-screen p-6">
     <div className="w-full max-w-lg bg-gray bg-opacity-90 backdrop-blur-md rounded-2xl shadow-2xl p-8 space-y-6 mb-8 mx-auto">
        <h2 className="text-4xl font-bold mb-6 text-center text-black">Admin Login</h2>
        <input
          type="text"
          placeholder="Username"
          value={userName}
          onKeyPress={handleKeyPress}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full mb-4 p-3 rounded border border-black-800 text-black "
        />
        <div className="relative">
        <input
          type={showPassword ? 'text' : 'password'}
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyPress={handleKeyPress}
          className="w-full mb-4 p-3 pr-12 rounded border border-black-800 text-black"
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700 focus:outline-none"
          tabIndex={-1}
          aria-label="Toggle password visibility"
        >
          <img
            src="/show-password-icon-18.jpg"
            alt="Toggle password visibility"
            className="w-8 h-8"
          />
        </button>
      </div>
      
        <button
          onClick={handleLogin}
          onKeyPress={handleKeyPress}
          disabled={loading || !userName.trim() || !password.trim()}
          className={`w-full py-3 rounded-md transition font-semibold text-lg ${
            loading || !userName.trim() || !password.trim()
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
         {loading ? 'Signing In...' : 'Sign In'}
        </button>
        {error && <p className="mt-4 text-red-500 text-center">{error}</p>}
      </div>
    </main>
  )
}