'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import ReturnButton from './returnButton'

export default function EditCompanyForm() {
  const [cId, setCId] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch('/api/company/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          C_id: parseInt(cId),
          Username: username,
          Password: password,
        }),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Failed to update company')
      }

      alert('Company Updated!')
      
      router.push('/admin_login/home')
    } catch (err: any) {
      alert(`Error updating company: ${err.message || 'Unknown error'}`)
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center px-4"><ReturnButton />
  <div className="w-full max-w-2xl bg-gray bg-opacity-90 backdrop-blur-md rounded-2xl shadow-2xl p-12 space-y-8 mb-8">
    

    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block mb-2 text-lg font-medium">Company ID (C_id)</label>
        <input
          type="number"
          value={cId}
          placeholder="Enter Company ID"
          onChange={(e) => setCId(e.target.value)}
          required
          className="w-full p-3 border rounded text-lg"
        />
      </div>

      <div>
        <label className="block mb-2 text-lg font-medium">Username</label>
        <input
          type="text"
          value={username}
          placeholder='Enter Username'
          onChange={(e) => setUsername(e.target.value)}
          required
          className="w-full p-3 border rounded text-lg"
        />
      </div>

      <div>
        <label className="block mb-2 text-lg font-medium">Password</label>
        <input
          type="text"
          value={password}
          placeholder='Enter Password'
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full p-3 border rounded text-lg"
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
  </div>
</div>


  )
}
