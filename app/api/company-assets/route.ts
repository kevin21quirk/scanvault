import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db";
import { authOptions } from "@/lib/auth";

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

    const { title, description, category, assetType, s3Key, originalName, mimeType, fileSize } = await request.json();

    if (!title?.trim()) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }
    if (!s3Key) {
      return NextResponse.json({ error: "s3Key is required — upload the file first via /presign" }, { status: 400 });
    }

    const asset = await (prisma as any).companyAsset.create({
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        category: category || "GENERAL",
        assetType: assetType || "DOCUMENT",
        s3Key,
        originalName: originalName || null,
        mimeType: mimeType || "application/octet-stream",
        fileSize: Number(fileSize) || 0,
        uploadedBy: session.user.email ?? null,
      },
    });

    return NextResponse.json(asset, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: "Failed to save asset", details: message }, { status: 500 });
  }
}
