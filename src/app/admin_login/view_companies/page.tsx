import ReturnButton from '@/app/components/returnButton'
import { prisma } from "@/app/lib/prisma"

export default async function ViewCompany() {
  const companies = await prisma.company.findMany()

  return (
    <main className="min-h-screen flex flex-col items-center justify-start gap-6 p-6">

      <ReturnButton />
      <h2 className="text-6xl font-bold mt-10 text-black-800">COMPANIES</h2>

      <section className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {companies.map((company) => (
          <div
            key={company.C_id}
           className="p-6 bg-white/50 border border-gray-200 rounded-2xl shadow-md hover:shadow-lg transition duration-200 shadow-black/50 hover:shadow-black/70"


          >
            <h3 className="text-xl font-semibold text-black-800 mb-2">Company ID: {company.C_id}</h3>
            <p><span className="font-semibold text-black-600">Username:</span> {company.Username}</p>
            <p><span className="font-semibold text-black-600">Password:</span> {company.Password}</p>
            <p><span className="font-semibold text-black-600">Created By:</span> {company.CreatedByAdmin}</p>
            <p><span className="font-semibold text-black-600">Created At:</span> {new Date(company.CreatedAt).toLocaleString()}</p>
            <p><span className="font-semibold text-black-600">Updated By:</span> {company.UpdatedByAdmin}</p>
            <p><span className="font-semibold text-black-600">Updated At:</span> {new Date(company.UpdatedAt).toLocaleString()}</p>
          </div>
        ))}
      </section>
    </main>
  )
}
