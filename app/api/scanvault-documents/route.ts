import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db";
import { authOptions } from "@/lib/auth";
import { uploadToS3, sanitiseFilename } from "@/lib/s3";
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

    const formData = await request.formData();
    const title = String(formData.get("title") || "");
    const description = String(formData.get("description") || "");
    const category = String(formData.get("category") || "GENERAL");
    const fileUrl = String(formData.get("fileUrl") || "");
    const file = formData.get("file") as File | null;

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }
    if (!file && !fileUrl) {
      return NextResponse.json({ error: "A file or file URL is required" }, { status: 400 });
    }

    const ALLOWED_TYPES = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "image/jpeg",
      "image/png",
      "image/webp",
    ];
    const MAX_BYTES = 50 * 1024 * 1024; // 50 MB

    let finalFileUrl: string | null = fileUrl || null;
    let finalS3Key: string | null = null;
    let finalOriginalName: string | null = null;
    let finalFileSize = 0;
    let finalMimeType = "application/pdf";

    if (file && file.size > 0) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        return NextResponse.json({ error: "File type not allowed" }, { status: 400 });
      }
      if (file.size > MAX_BYTES) {
        return NextResponse.json({ error: "File exceeds 50 MB limit" }, { status: 400 });
      }

      const bytes = Buffer.from(await file.arrayBuffer());
      finalFileSize = bytes.length;
      finalMimeType = file.type;
      finalOriginalName = file.name;

      const safeName = sanitiseFilename(file.name);
      finalS3Key = `scanvault-documents/${randomUUID()}/${safeName}`;

      await uploadToS3(finalS3Key, bytes, finalMimeType);
      finalFileUrl = null; // stored in S3, not as a public URL
    }

    const document = await (prisma as any).scanVaultDocument.create({
      data: {
        title,
        description: description || null,
        category: category || "GENERAL",
        fileUrl: finalFileUrl,
        s3Key: finalS3Key,
        originalName: finalOriginalName,
        uploadedBy: session.user.email ?? null,
        fileSize: finalFileSize,
        mimeType: finalMimeType,
      },
    });

    return NextResponse.json(document, { status: 201 });
  } catch (error) {
    console.error("Error creating ScanVault document:", error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: "Failed to create document", details: message }, { status: 500 });
  }
}
