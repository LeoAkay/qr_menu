
import { prisma } from "@/app/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(
  req: Request,
  { params }: { params: Promise<{ companyId: string }> }
) {
  try {
    const { companyId } = await params

    if (!companyId) {
      return NextResponse.json({ error: "Missing company ID" }, { status: 400 })
    }

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
    console.error("PDF retrieve error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
} 