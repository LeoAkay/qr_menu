'use client'

import { useRouter } from 'next/navigation'

export default function ViewAdminsButton() {
  const router = useRouter()

  return (
    <button
      onClick={() => router.push('/admin_login/view_admins')}
      className="absolute left-80 top-28 px-8 py-4 text-xl bg-blue-600 text-white rounded-2xl hover:bg-green-700 transition shadow-lg"
    >
      View Admins
    </button>
  )
}
