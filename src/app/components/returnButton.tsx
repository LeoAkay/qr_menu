'use client'

import { useRouter } from 'next/navigation'

export default function ReturnButton() {
  const router = useRouter()

  const handleReturn = () => {
    router.push('/admin_login/home')
  }

  return (
    <button
      onClick={handleReturn}
      className="absolute top-12 right-8 bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700 transition"
    >
      Return
    </button>
  )
}
