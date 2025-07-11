'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function LoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')


  const handleLogin = async () => {
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })

      if (!res.ok) {
        throw new Error('Login failed')
      }

      const data = await res.json()
      localStorage.setItem('isAdmin', 'true')
      localStorage.setItem('adminId', data.admin.Admin_id)
      localStorage.setItem('User_Name', data.admin.user_name)

      router.push('/admin_login/home')
    } catch (err) {
      setError('Invalid credentials')
      console.error(err)
    }
  }

  return (
    <main className="flex items-center justify-center min-h-screen p-6">
      <div className="p-6 rounded-lg shadow-lg w-full max-w-xl text-white bg-white-800">
        <h2 className="text-3xl font-bold mb-6 text-center text-black">Admin Login</h2>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full mb-4 p-2 rounded border border-gray-800 text-black"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mb-4 p-2 rounded border border-gray-800 text-black"
        />
        <button
          onClick={handleLogin}
          className="w-full bg-black text-white py-2 rounded hover:bg-gray-800 transition"
        >
          Login
        </button>
        {error && <p className="mt-4 text-red-500 text-center">{error}</p>}
      </div>
    </main>
  )
}