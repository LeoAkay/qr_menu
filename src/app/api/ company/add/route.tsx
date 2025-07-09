import { prisma } from "@/app/lib/prisma"
import { NextResponse } from "next/server"

function serializeCompany(company: any) {
  return {
    ...company,
    C_id: company.C_id.toString(),
  }
}

export async function POST(req: Request) {
  const { C_id, Username, Password, C_Name } = await req.json()

  if (!C_id || !Username || !Password) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  try {
    const existingCompany = await prisma.company.findFirst({
      where: {
        C_id: BigInt(C_id),
        Username,
        Password,
      },
    })

    let company

    if (existingCompany) {
      // Update existing
      company = await prisma.company.update({
        where: { C_id: existingCompany.C_id },
        data: { C_Name },
      })
    } else {
      // Create new
      company = await prisma.company.create({
        data: {
          C_id: BigInt(C_id),
          Username,
          Password,
          C_Name,
        },
      })
    }

    return NextResponse.json(serializeCompany(company))
  } catch (error) {
    console.error('Error handling company:', error)
    return NextResponse.json({ error: 'Failed to process company' }, { status: 500 })
  }
}
