import LogoutButton from '@/app/components/AdminComponents/LogoutButtonForAdminPanel'
import { prisma } from "@/app/lib/prisma"
import CreateCompanyButton from '@/app/components/AdminComponents/CreateCompanyButton'
import UpdateCompanyButton from '@/app/components/AdminComponents/UpdateCompanyButton'
import ViewAdminsButton from '@/app/components/AdminComponents/viewAdminButton'



export default async function ViewCompany() {
  const users = await prisma.user.findMany({
    where: { role: { roleName: 'User' } },
    include: {
      company: {
        include: {
          creator: true,  
          updater: true,  
        }
      }
    },
    orderBy: { cId: 'asc' },
  })

  return (
    <div className="min-h-screen bg-white">
      <div className="relative px-6 text-black mb-16">
        <main className="max-w-xl mx-auto pt-12">
          <h1 className="text-6xl font-bold mb-8 text-center">Admin Dashboard</h1>
          <div className="flex flex-col items-center gap-6 mb-12">
            <LogoutButton/>
            <CreateCompanyButton />
            <ViewAdminsButton/>
          </div>
        </main>
      </div>
      
      <main className="flex flex-col items-center justify-start gap-8 px-8 pb-8 pt-8">
        <section className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {users.map((user) => {
            const { company } = user
            return (
              <div
                key={user.cId}
                className="p-8 bg-gray bg-opacity-90 backdrop-blur-md border border-gray-200 rounded-2xl shadow-lg hover:shadow-xl transition duration-300 shadow-black/50 hover:shadow-black/70"
              >
                <h3 className="text-2xl font-semibold text-black-800 mb-2">
                  Company ID: {user.cId}
                </h3>
                <p className="text-lg">
                  <span className="font-semibold text-black-600">Username:</span> {user.userName}
                </p>
                <p className="text-lg">
                  <span className="font-semibold text-black-600">Password:</span> {user.password}
                </p>
                {company && (
                  <>
                    <p className="text-lg mt-2 font-semibold">Audit Info:</p>
                    <p className='text-sm'>
                      <span className="font-semibold">Company Name:</span> {company.C_Name || 'N/A'}
                    </p>
                    <p className='text-sm'>
                      <span className="font-semibold">Menu Type:</span> {company.menuType || 'N/A'}
                    </p>
                    <p className="text-sm">
                      <span className="font-semibold">Created By:</span> {company.creator?.userName || 'N/A'}
                    </p>
                    <p className="text-sm">
                      <span className="font-semibold">Created At:</span> {new Date(company.CreatedAt).toLocaleString()}
                    </p>
                    <p className="text-sm">
                      <span className="font-semibold">Updated By:</span> {company.updater?.userName || 'N/A'}
                    </p>
                    <p className="text-sm">
                      <span className="font-semibold">Updated At:</span> {new Date(company.UpdatedAt).toLocaleString()}
                    </p>
                  </>
                )}
                <UpdateCompanyButton cId={user.cId} userName={user.userName} password={user.password}/>
              </div>
            )
          })}
        </section>
      </main>
    </div>
  )
}
