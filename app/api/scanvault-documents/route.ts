import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db";
import { authOptions } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { randomUUID } from "crypto";

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
    const { title, description, category, fileUrl, fileData, fileSize, mimeType } = body;

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }
    if (!fileUrl && !fileData) {
      return NextResponse.json({ error: "A file or file URL is required" }, { status: 400 });
    }

    let finalFileUrl = fileUrl;
    let finalFileSize = fileSize ? parseInt(fileSize) : 0;
    let finalMimeType = mimeType || "application/pdf";

    if (fileData) {
      const match = fileData.match(/^data:([^;]+);base64,(.+)$/);
      if (!match) {
        return NextResponse.json({ error: "Invalid file data" }, { status: 400 });
      }
      finalMimeType = match[1] || finalMimeType;
      const buffer = Buffer.from(match[2], "base64");
      finalFileSize = buffer.length;

      const ext = finalMimeType.split("/").pop() || "bin";
      const filename = `${randomUUID()}.${ext}`;
      const uploadDir = path.join(process.cwd(), "public", "uploads", "scanvault");
      if (!existsSync(uploadDir)) await mkdir(uploadDir, { recursive: true });

      await writeFile(path.join(uploadDir, filename), buffer);
      finalFileUrl = `/uploads/scanvault/${filename}`;
    }

    const document = await (prisma as any).scanVaultDocument.create({
      data: {
        title,
        description: description || null,
        category: category || "GENERAL",
        fileUrl: finalFileUrl,
        fileSize: finalFileSize,
        mimeType: finalMimeType,
      },
    });

    return NextResponse.json(document, { status: 201 });
  } catch (error) {
    console.error("Error creating ScanVault document:", error);
    return NextResponse.json({ error: "Failed to create document" }, { status: 500 });
  }
}
