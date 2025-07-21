'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import ReturnButton from './returnButton'

export default function CompanyForm() {
  const [cId, setCId] = useState('')
  const [userName, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);

  try {
    const adminId = localStorage.getItem('adminId');
    if (!adminId) {
      alert('Admin not logged in');
      setLoading(false);
      return;
    }

    const res = await fetch('/api/AdminPanel/company/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cId: parseInt(cId),
        userName,
        password,
        createdBy: adminId,  // pass admin id here
      }),
    });

    if (!res.ok) throw new Error('Failed to add company');

   alert('Company Created!')
      
      router.push('/admin_login/view_companies')
  } catch (err) {
    alert('Error adding company');
    console.error(err);
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="fixed inset-0 flex items-start justify-center mt-28">
  <form
    onSubmit={handleSubmit}
    className="w-full max-w-2xl bg-gray bg-opacity-90 backdrop-blur-md rounded-2xl shadow-2xl p-12 space-y-8 mb-8 mx-auto"
  >
    
    <div>
      <label className="block mb-3 text-lg font-medium">Company ID (C_id) *has to start from 100</label>
      <input
        type="number"
        value={cId}
        placeholder="Enter Company ID"
        onChange={(e) => setCId(e.target.value)}
        required
        className="w-full p-4 border rounded text-lg"
      />
    </div>

    <div>
      <label className="block mb-3 text-lg font-medium">Username</label>
      <input
        type="text"
        value={userName}
        placeholder="Enter Username"
        onChange={(e) => setUsername(e.target.value)}
        required
        className="w-full p-4 border rounded text-lg"
      />
    </div>

    <div>
      <label className="block mb-3 text-lg font-medium">Password</label>
      <input
        type="text"
        value={password}
        placeholder="Enter Password"
        onChange={(e) => setPassword(e.target.value)}
        required
        className="w-full p-4 border rounded text-lg"
      />
    </div>

    <button
      type="submit"
      disabled={loading}
      className="w-full bg-green-600 text-white px-8 py-4 rounded-md hover:bg-green-700 transition duration-300 text-xl font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? 'Adding...' : 'Add Company'}
    </button>
  </form>
</div>

  )
}