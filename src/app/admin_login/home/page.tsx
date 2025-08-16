'use client' 

import LogoutButton from '@/app/components/AdminComponents/LogoutButtonForAdminPanel'
import { useRouter } from 'next/navigation'

export default function AdminHome() {
  const router = useRouter()

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-white relative">
      
      <h1 className="text-6xl font-extrabold mb-16 text-center w-full tracking-wide text-gray-800">
        ADMIN DASHBOARD
      </h1>
      
      <div className="absolute top-10 right-8">
        <LogoutButton />
      </div>
      
      <div className="flex flex-row items-center justify-center gap-8 w-full max-w-4xl px-4">
    <button
      onClick={() => router.push('/admin_login/create_company')}
      className="px-12 py-6 text-xl bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition shadow-lg"
    >
      Create New Company
    </button>

    <button
      onClick={() => router.push('/admin_login/edit_company')}
      className="px-12 py-6 text-xl bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition shadow-lg"
    >
      Edit Company
    </button>

    <button
      onClick={() => router.push('/admin_login/view_companies')}
      className="px-12 py-6 text-xl bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition shadow-lg"
    >
      View Companies
    </button>
  </div>
</main>

  )
}
