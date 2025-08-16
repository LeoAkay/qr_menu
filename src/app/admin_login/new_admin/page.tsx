import AdminForm from "@/app/components/AdminComponents/adminform"
import ReturnButtonAdmin from "@/app/components/AdminComponents/ReturnButtonAdmin"
export default async function adminPage() {

  return (
    <div className="relative min-h-screen px-6 text-black bg-white">
      <ReturnButtonAdmin/>
      <main className="max-w-xl mx-auto pt-12">
        <h1 className="text-6xl font-bold mb-4 text-center">Create New Admin</h1>
        <AdminForm/>
      </main>
    </div>
  )
}