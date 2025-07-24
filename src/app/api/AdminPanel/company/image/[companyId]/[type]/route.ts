import { prisma } from "@/app/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  context: { params: Promise<{ companyId: string; type: string }> }
) {
  try {
    const params = await context.params; // Await params here
    const { companyId, type } = params;

    if (!companyId || !type || (type !== "logo" && type !== "welcoming")) {
      return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
    }

    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: {
        C_Logo_Image: type === "logo",
        Welcoming_Page: type === "welcoming",
      },
    });

    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    const imageData = type === "logo" ? company.C_Logo_Image : company.Welcoming_Page;

    if (!imageData) {
      return NextResponse.json({ error: "Image not found" }, { status: 404 });
    }

    return new NextResponse(imageData, {
      headers: {
        "Content-Type": "image/jpeg",
        "Cache-Control": "public, max-age=31536000",
      },
    });
  } catch (error) {
    console.error("Image retrieve error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
