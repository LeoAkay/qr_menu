import CompanyForm from "../components/companyform"
import { prisma } from "../lib/prisma"


export default async function Page() {
  const companies = await prisma.company.findMany()

  return (
    <main className="p-6 max-w-xl mx-auto">
  <h1 className="text-3xl font-bold mb-4 text-center">ADMIN PANEL</h1>
  <h2 className="text-3xl font-bold mb-4">Add a Company</h2>

      <CompanyForm />

      <h2 className="text-2xl font-bold mb-4 mt-10">Companies</h2>
      <ul className="space-y-2">
        {/* {companies.map((company) => (
          <li key={company.C_id} className="p-4 border rounded shadow">
            <p><strong>C_id:</strong>{company.C_id}</p>
            <p><strong>Username:</strong>{company.Username}</p>
            <p><strong>Company Name:</strong> {company.C_Name}</p>
            <p><strong>Password:</strong> {company.Password}</p>
          </li>
        ))} */}
      </ul>
    </main>
  )
}
