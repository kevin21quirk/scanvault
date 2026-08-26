import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db";
import { authOptions } from "@/lib/auth";
import { uploadToS3, sanitiseFilename } from "@/lib/s3";
import { randomUUID } from "crypto";

const ALLOWED_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
];

const MAX_BYTES = 50 * 1024 * 1024; // 50 MB

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const assets = await (prisma as any).companyAsset.findMany({
      orderBy: { uploadedAt: "desc" },
    });

    return NextResponse.json(assets);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: "Failed to fetch assets", details: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const title = String(formData.get("title") || "").trim();
    const description = String(formData.get("description") || "").trim();
    const category = String(formData.get("category") || "GENERAL");
    const assetType = String(formData.get("assetType") || "DOCUMENT");
    const file = formData.get("file") as File | null;

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }
    if (!file || file.size === 0) {
      return NextResponse.json({ error: "A file is required" }, { status: 400 });
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: "File type not allowed. Accepted: PDF, Word, Excel, PowerPoint, JPEG, PNG, WebP, GIF, SVG." }, { status: 400 });
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: "File exceeds 50 MB limit" }, { status: 400 });
    }

    const bytes = Buffer.from(await file.arrayBuffer());
    const safeName = sanitiseFilename(file.name);
    const s3Key = `company-assets/${randomUUID()}/${safeName}`;

    await uploadToS3(s3Key, bytes, file.type);

    const asset = await (prisma as any).companyAsset.create({
      data: {
        title,
        description: description || null,
        category,
        assetType,
        s3Key,
        originalName: file.name,
        mimeType: file.type,
        fileSize: bytes.length,
        uploadedBy: session.user.email ?? null,
      },
    });

    return NextResponse.json(asset, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: "Failed to upload asset", details: message }, { status: 500 });
  }
}
