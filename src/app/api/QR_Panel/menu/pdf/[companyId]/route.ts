import { prisma } from "@/app/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(
  req: Request,
  { params }: { params: Promise<{ companyId: string }> }
) {
  try {
    const { companyId } = await params

    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: {
        pdfMenuUrl: true,
        C_Name: true
      }
    })

    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 })
    }

    if (!company.pdfMenuUrl) {
      return NextResponse.json({ error: "PDF not found" }, { status: 404 })
    }

    // Redirect to Supabase storage URL
    return NextResponse.redirect(company.pdfMenuUrl)

  } catch (error) {
    console.error("PDF serve error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
} 