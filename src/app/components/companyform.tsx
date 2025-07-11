'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function CompanyForm() {
  const [cId, setCId] = useState('')
  const [userName, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch('/api/company/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cId: parseInt(cId),
          userName,
          password,
        }),
      })

      if (!res.ok) throw new Error('Failed to add company')

      // ✅ Redirect after success
      router.push('/admin_login/home')
    } catch (err) {
      alert('Error adding company')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mb-8 max-w-md mx-auto">
      <div>
        <label className="block font-medium">Company ID (C_id)</label>
        <input
          type="number"
          value={cId}
          onChange={(e) => setCId(e.target.value)}
          required
          className="w-full p-2 border rounded"
        />
      </div>

      <div>
        <label className="block font-medium">Username</label>
        <input
          type="text"
          value={userName}
          onChange={(e) => setUsername(e.target.value)}
          required
          className="w-full p-2 border rounded"
        />
      </div>

      <div>
        <label className="block font-medium">Password</label>
        <input
          type="text"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full p-2 border rounded"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700 transition duration-300 text-xl font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Adding...' : 'Add Company'}
      </button>
    </form>
  )
}
