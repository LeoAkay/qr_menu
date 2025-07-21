
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
        pdfMenuFile: true
      }
    })

    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 })
    }

    if (!company.pdfMenuFile) {
      return NextResponse.json({ error: "PDF not found" }, { status: 404 })
    }

    // Return the PDF as a response
    return new NextResponse(company.pdfMenuFile, {
      headers: {
        'Content-Type': 'application/pdf',
        'Cache-Control': 'no-cache, no-store, must-revalidate', // No caching for fresh updates
        'Pragma': 'no-cache',
        'Expires': '0',
        'Content-Disposition': 'inline; filename="menu.pdf"'
      }
    })

  } catch (error) {
    console.error("PDF retrieve error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
} 