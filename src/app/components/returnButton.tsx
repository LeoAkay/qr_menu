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
      className="absolute top-4 right-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
    >
      Return
    </button>
  )
}
