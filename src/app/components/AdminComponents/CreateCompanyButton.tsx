'use client'

import { useRouter } from 'next/navigation'

export default function CreateCompanyButton() {
  const router = useRouter()

  return (
    <button
      onClick={() => router.push('/admin_login/create_company')}
      className="absolute left-12 top-28 px-8 py-4 text-xl bg-blue-600 text-white rounded-2xl hover:bg-green-700 transition shadow-lg"
    >
      Create New Company
    </button>
  )
}
