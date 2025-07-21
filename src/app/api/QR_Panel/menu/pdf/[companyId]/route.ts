import { prisma } from "@/app/lib/prisma"
import { NextResponse } from "next/server"
import { readFile } from 'fs/promises'
import { join } from 'path'

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

    if (!company || !company.pdfMenuUrl) {
      return NextResponse.json({ error: "PDF not found" }, { status: 404 })
    }

    // Extract filename from URL path
    const fileName = company.pdfMenuUrl.split('/').pop()
    if (!fileName) {
      return NextResponse.json({ error: "Invalid PDF path" }, { status: 404 })
    }

    // Read file from disk
    const filePath = join(process.cwd(), 'public', 'uploads', 'pdf', fileName)
    const fileBuffer = await readFile(filePath)

    // Return the PDF file with proper headers
    const response = new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${company.C_Name || 'menu'}.pdf"`,
        'Cache-Control': 'public, max-age=3600' // Cache for 1 hour
      }
    })

    return response

  } catch (error) {
    console.error("PDF serve error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
} 