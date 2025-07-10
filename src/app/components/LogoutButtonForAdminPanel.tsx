'use client'

import { useRouter } from 'next/navigation'

export default function LogoutButton() {
  const router = useRouter()

  const handleLogout = () => {
    localStorage.removeItem('isAdmin')
    router.push('/admin_login')
  }

  return (
    <button
      onClick={handleLogout}
      className="absolute top-4 right-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
    >
      Logout
    </button>
  )
}
