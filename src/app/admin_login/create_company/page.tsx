import CompanyForm from "@/app/components/companyform"
import ReturnButton from "@/app/components/returnButton"

export default async function DashboardPage() {

  return (
    <div className="relative min-h-screen px-6 text-black">
      <ReturnButton/>
      <main className="max-w-xl mx-auto pt-12">
      
      <h1 className="text-6xl font-bold mb-4 text-center">Create Company</h1>
      <CompanyForm/>
      </main>
    </div>
  )
}