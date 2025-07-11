'use client'

import { useState, useEffect } from 'react'

type Company = {
  C_id: number
  Username: string
  Password: string
}

export default function EditCompanyForm() {
  const [cId, setCId] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const adminId = localStorage.getItem('adminId')

    if (!adminId) {
      alert('Admin not logged in')
      setLoading(false)
      return
    }

    try {
      const res = await fetch('/api/company/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          // Make sure to send C_id
          C_id: parseInt(cId), // Convert cId to a number as expected by the API
          Username: username,
          Password: password,
          UpdatedByAdmin: adminId, // Changed from CreatedByAdmin to UpdatedByAdmin
        }),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Failed to update company')
      }

      alert('Company Updated!')
      setCId('')
      setUsername('')
      setPassword('')
    } catch (err: any) {
      alert(`Error updating company: ${err.message || 'Unknown error'}`)
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
          value={username}
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
        {loading ? 'Updating...' : 'Update Company'}
      </button>
    </form>
  )
}