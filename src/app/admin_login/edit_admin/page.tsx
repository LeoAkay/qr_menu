import EditAdminForm from "@/app/components/AdminComponents/edit_Admin"
import ReturnButtonAdmin from "@/app/components/AdminComponents/ReturnButtonAdmin"

export default async function EditAdminPage() {
  
  return (
    <div className="relative min-h-screen px-6 text-black">
      <main className="max-w-xl mx-auto pt-12">
        <ReturnButtonAdmin/>
        
        <h1 className="text-6xl font-bold mb-4 text-center">Edit Admin</h1>
        <EditAdminForm/>
      </main>
    </div>
  )
}
