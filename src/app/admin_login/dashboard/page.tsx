import CompanyForm from "../../components/companyform"
import { prisma } from "../../lib/prisma"
import LogoutButton from "../../components/LogoutButtonForAdminPanel"

export default async function DashboardPage() {
  const companies = await prisma.company.findMany()

  return (
    <div className="relative min-h-screen px-6 text-black">
      <LogoutButton />
      <main className="max-w-xl mx-auto pt-12">
        <h1 className="text-3xl font-bold mb-4 text-center">ADMIN PANEL</h1>
        <h2 className="text-3xl font-bold mb-4">Add a Company</h2>

        <CompanyForm />

        <h2 className="text-2xl font-bold mb-4 mt-10">Companies</h2>
        <ul className="space-y-2">
          {companies.map((company) => (
             <li key={company.C_id} className="p-4 border rounded shadow bg-white bg-opacity-80 backdrop-blur-sm">
              <p><strong>C_id:</strong> {company.C_id}</p>
              <p><strong>Username:</strong> {company.Username}</p>          
              <p><strong>Password:</strong> {company.Password}</p>
              <p><strong>Created By Admin:</strong> {company.CreatedByAdmin}</p>
              <p><strong>Created at:</strong> {new Date(company.CreatedAt).toLocaleString()}</p>
              <p><strong>Updated By Admin:</strong> {company.UpdatedByAdmin}</p>
              <p><strong>Updated at:</strong> {new Date(company.UpdatedAt).toLocaleString()}</p>
            </li>
          ))}
        </ul>
      </main>
    </div>
  )
}
