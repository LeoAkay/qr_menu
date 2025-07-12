'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [userName, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleLogin = async () => {
    setError('')
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userName, password }),
        credentials: 'include', // Important to send cookies
      })

      if (!res.ok) throw new Error('Login failed')

      const data = await res.json()
      // Optionally store admin info locally
      localStorage.setItem('adminId', data.admin.Admin_id)
      localStorage.setItem('User_Name', data.admin.userName)

      router.push('/admin_login/home')
    } catch (err) {
      setError('Invalid credentials')
      console.error('Login error:', err)
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
          onChange={(e) => setUsername(e.target.value)}
          className="w-full mb-4 p-3 rounded border border-black-800 text-black "
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mb-4 p-3 rounded border border-black-800 text-black"
        />
        <button
          onClick={handleLogin}
          className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 transition font-semibold text-lg"
        >
          LogIn
        </button>
        {error && <p className="mt-4 text-red-500 text-center">{error}</p>}
      </div>
    </main>
  )
}
