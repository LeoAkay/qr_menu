'use client'

import { useRouter } from 'next/navigation'

export default function UpdateAdminButton({ cId,userName,password }: { cId: number,userName: string, password: string
 }) {
  const router = useRouter()

  return (
    <button
      onClick={() => router.push(`/admin_login/edit_admin?cId=${cId}&username=${userName}&password=${password}`)}
      className="absolute top-7 right-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-green-600 text-sm shadow-md transition"
    >
      Update
    </button>
  )
}
