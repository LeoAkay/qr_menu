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
    <><div className="relative max-h-screen px-6 text-black">

      <main className="max-w-xl mx-auto pt-12 ">

        <h1 className="text-6xl font-bold mb-4 text-center">Create Company</h1>
        <ReturnButton />
      </main>
    </div><main className="max-h-screen flex flex-col items-center justify-start gap-8 p-8 ">

        <section className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
  {filteredUsers.map((user) => (
    <div
      key={user.cId}
      className="p-8 bg-gray bg-opacity-90 backdrop-blur-md border border-gray-200 rounded-2xl shadow-lg hover:shadow-xl transition duration-300 shadow-black/50 hover:shadow-black/70"
    >
      <h3 className="text-2xl font-semibold text-black-800 mb-4">
        Company ID: {user.cId}
      </h3>
      <p className="text-lg">
        <span className="font-semibold text-black-600">Username:</span> {user.userName}
      </p>
      <p className="text-lg">
        <span className="font-semibold text-black-600">Password:</span> {user.password}
      </p>
    </div>
  ))}
</section>
      </main></>

  )
}
