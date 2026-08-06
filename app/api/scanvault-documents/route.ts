import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "ACCOUNTANT")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const documents = await (prisma as any).scanVaultDocument.findMany({
      orderBy: { uploadedAt: "desc" },
    });

    return NextResponse.json(documents);
  } catch (error) {
    console.error("Error fetching ScanVault documents:", error);
    return NextResponse.json({ error: "Failed to fetch documents" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, category, fileUrl, fileSize, mimeType } = body;

    if (!title || !fileUrl) {
      return NextResponse.json({ error: "Title and file URL are required" }, { status: 400 });
    }

    const document = await (prisma as any).scanVaultDocument.create({
      data: {
        title,
        description: description || null,
        category: category || "GENERAL",
        fileUrl,
        fileSize: fileSize ? parseInt(fileSize) : 0,
        mimeType: mimeType || "application/pdf",
      },
    });

    return NextResponse.json(document, { status: 201 });
  } catch (error) {
    console.error("Error creating ScanVault document:", error);
    return NextResponse.json({ error: "Failed to create document" }, { status: 500 });
  }
}
