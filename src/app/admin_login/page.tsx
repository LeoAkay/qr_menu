'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [userName, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
   const [loading, setLoading] = useState(false)

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

      if (!res.ok) throw new Error('Login failed')

      const data = await res.json()
      localStorage.setItem('adminId', data.admin.id);
      localStorage.setItem('User_Name', data.admin.userName);

      router.push('/admin_login/view_companies')
    } catch (err) {
      setError('Invalid credentials')
      console.error('Login error:', err)
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
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyPress={handleKeyPress}
          className="w-full mb-4 p-3 rounded border border-black-800 text-black"
        />
        <button
          onClick={handleLogin}
          onKeyPress={handleKeyPress}
          disabled={loading || !userName || !password}
          className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 transition font-semibold text-lg"
        >
         {loading ? 'Signing In...' : 'Sign In'}
        </button>
        {error && <p className="mt-4 text-red-500 text-center">{error}</p>}
      </div>
    </main>
  )
}