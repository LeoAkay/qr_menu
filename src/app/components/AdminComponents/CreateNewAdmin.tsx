'use client'

import { useRouter } from 'next/navigation'

export default function CreateNewAdmin() {
  const router = useRouter()

  return (
    <button
      onClick={() => router.push('/admin_login/new_admin')}
      className="absolute left-12 top-28 px-8 py-4 text-xl bg-blue-600 text-white rounded-2xl hover:bg-green-700 transition shadow-lg"
    >
      Create New Admin
    </button>
  )
}
