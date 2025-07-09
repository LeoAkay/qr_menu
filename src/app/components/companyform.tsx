'use client'

import { useState } from 'react'

export default function CompanyForm() {
  const [cId, setCId] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [cName, setCName] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch('/api/company/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          C_id: parseInt(cId),
          Username: username,
          Password: password,
          C_Name: cName,
        }),
      })

      if (!res.ok) {
        console.log(res)
        throw new Error('Failed to add company')
      }

      alert('Company added!')
      setCId('')
      setUsername('')
      setPassword('')
      setCName('')
    } catch (err) {
      alert('Error adding company')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mb-8 max-w-md">
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

      <div>
        <label className="block font-medium">Restaurant Name (C_Name)</label>
        <input
          type="text"
          value={cName}
          onChange={(e) => setCName(e.target.value)}
          required
          className="w-full p-2 border rounded"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        {loading ? 'Adding...' : 'Add Company'}
      </button>
    </form>
  )
}
