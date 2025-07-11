'use client' 

import LogoutButton from '@/app/components/LogoutButtonForAdminPanel'
import { useRouter } from 'next/navigation'

export default function AdminHome() {
  const router = useRouter()

  return (
   <main className="min-h-screen flex flex-col items-center justify-center p-6">

  <h1 className="text-6xl font-bold mb-8 text-center w-full absolute top-12">ADMIN DASHBOARD</h1>


  <div className="mt-20"> 
    <LogoutButton />
  </div>

  <div className="flex flex-wrap justify-center gap-6 mt-8"> 
    <button
      onClick={() => router.push('/admin_login/create_company')}
      className="px-10 py-5 text-lg bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
    >
      Create New Company
    </button>
    <button
      onClick={() => router.push('/admin_login/edit_company')}
      className="px-10 py-5 text-lg bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
    >
      Edit Company
    </button>
    <button
      onClick={() => router.push('/admin_login/view_companies')}
      className="px-10 py-5 text-lg bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
    >
      View Companies
    </button>
  </div>
</main>
  )
}
