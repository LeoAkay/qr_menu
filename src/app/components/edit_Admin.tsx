'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function EditAdminForm() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [cId, setCId] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [Pass, setPass] = useState('')
  const [loading, setLoading] = useState(false)

  // Auto-fill Company ID from query
  useEffect(() => {
    const companyId = searchParams.get('cId')
    const userName = searchParams.get('username')
    if (companyId) {
      setCId(companyId)
    }
    if (userName) {
      setUsername(userName)
    }
    
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch('/api/admin/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          C_id: parseInt(cId),
          Username: username,
          Pass: Pass,
          Password: password,
          updatedBy: localStorage.getItem('adminId'),
        }),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Failed to update Admin')
      }

      alert('Admin Updated!')
      
      router.push('/admin_login/view_admins')
    } catch (err: any) {
      alert(`Error updating Admin: ${err.message || 'Unknown error'}`)
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 flex items-start justify-center mt-28">

  <div className="w-full max-w-2xl bg-gray bg-opacity-90 backdrop-blur-md rounded-2xl shadow-2xl p-12 space-y-8 mb-8">
    

    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block mb-2 text-lg font-medium">Admin ID (C_id)</label>
        <input
          type="number"
          value={cId}
          placeholder="Enter Admin ID"
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
        <label className="block mb-2 text-lg font-medium"> Old Password</label>
        <input
          type="text"
          value={Pass}
          placeholder='Enter Old Password'
          onChange={(e) => setPass(e.target.value)}
          required
          className="w-full p-3 border rounded text-lg"
        />
      </div>

      <div>
        <label className="block mb-2 text-lg font-medium"> New Password</label>
        <input
          type="text"
          value={password}
          placeholder='Enter New Password'
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
        {loading ? 'Updating...' : 'Update Admin'}
      </button>
    </form>
  </div>
</div>


  )
}
