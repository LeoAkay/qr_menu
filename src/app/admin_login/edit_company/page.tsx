import EditCompanyForm from "@/app/components/AdminComponents/updateForm"
import ReturnButton from "@/app/components/AdminComponents/returnButton"

export default async function EditPage() {
  
  return (
    <div className="relative min-h-screen px-6 text-black">
      <main className="max-w-xl mx-auto pt-12">
        <ReturnButton/>
        <h1 className="text-6xl font-bold mb-4 text-center">Edit Company</h1>
        <EditCompanyForm/>
      </main>
    </div>
  )
}
