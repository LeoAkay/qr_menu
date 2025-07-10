import { prisma } from "@/app/lib/prisma"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  const { C_id, Username, Password, CreatedByAdmin,UpdatedByAdmin } = await req.json()

  if (!C_id || !Username || !Password) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  try {
    const existingCompany = await prisma.company.findFirst({
      where: {
        C_id,
        Username,
        Password,
        CreatedByAdmin,
      },
    })

    let company

    if (existingCompany) {
      // Update existing
      company = await prisma.company.update({
        where: { C_id: existingCompany.C_id },
        data: { UpdatedByAdmin },
      })
    } else {
      // Create new
      company = await prisma.company.create({
        data: {
          C_id,
          Username,
          Password,
          CreatedByAdmin,
        },
      })
    }

    return NextResponse.json(company)
  } catch (error) {
    console.error('Error handling company:', error)
    return NextResponse.json({ error: 'Failed to process company' }, { status: 500 })
  }
}
