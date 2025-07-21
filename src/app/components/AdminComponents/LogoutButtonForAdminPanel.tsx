'use client'

import { useRouter } from 'next/navigation'

export default function LogoutButton() {
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await fetch('/api/AdminPanel/admin/logout', {
        method: 'POST',
        credentials: 'include', // send cookies to clear on server
      })

      localStorage.clear() // clear any stored admin data
      router.push('/admin_login') // redirect to login page
    } catch (err) {
      console.error('Logout failed:', err)
    }
  }

  return (
    <button
      onClick={handleLogout}
      className="absolute top-12 right-8 bg-red-600 text-white px-6 py-3 rounded hover:bg-red-700 transition"
    >
      Logout
    </button>
  )
}
