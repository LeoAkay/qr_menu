import ReturnButton from '@/app/components/returnButton'
import { prisma } from "@/app/lib/prisma"

export default async function ViewCompany() {
  const company = await prisma.company.findMany()
  const user = await prisma.user.findMany()

  // Filter and sort users by cId
  const filteredUsers = user
    .filter((u) => u.cId !== 0)
    .sort((a, b) => a.cId - b.cId) // ascending sort

  return (
    <main className="min-h-screen flex flex-col items-center justify-start gap-6 p-6">
      <ReturnButton />
      <h2 className="text-6xl font-bold mt-10 text-black-800">COMPANIES</h2>

      <section className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredUsers.map((user) => (
          <div
            key={user.cId}
            className="p-6 bg-white/50 border border-gray-200 rounded-2xl shadow-md hover:shadow-lg transition duration-200 shadow-black/50 hover:shadow-black/70"
          >
            <h3 className="text-xl font-semibold text-black-800 mb-2">Company ID: {user.cId}</h3>
            <p><span className="font-semibold text-black-600">Username:</span> {user.userName}</p>
            <p><span className="font-semibold text-black-600">Password:</span> {user.password}</p>
          </div>
        ))}
      </section>
    </main>
  )
}
