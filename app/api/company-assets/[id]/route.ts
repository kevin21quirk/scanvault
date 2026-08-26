import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db";
import { authOptions } from "@/lib/auth";
import { getPresignedDownloadUrl, deleteFromS3 } from "@/lib/s3";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const asset = await (prisma as any).companyAsset.findUnique({ where: { id } });
    if (!asset) {
      return NextResponse.json({ error: "Asset not found" }, { status: 404 });
    }
    if (!asset.s3Key) {
      return NextResponse.json({ error: "No file associated with this asset" }, { status: 404 });
    }

    const forDownload = new URL(request.url).searchParams.get("download") === "1";
    const disposition = forDownload ? "attachment" : "inline";

    // 7-day presigned URL for sharing
    const url = await getPresignedDownloadUrl(asset.s3Key, asset.originalName, 604800, disposition);
    return NextResponse.json({ url, filename: asset.originalName, mimeType: asset.mimeType });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: "Failed to get asset URL", details: message }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { title, description, category, assetType } = await request.json();

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const asset = await (prisma as any).companyAsset.update({
      where: { id },
      data: { title, description: description || null, category, assetType },
    });

    return NextResponse.json(asset);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: "Failed to update asset", details: message }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const asset = await (prisma as any).companyAsset.findUnique({ where: { id } });
    if (!asset) {
      return NextResponse.json({ error: "Asset not found" }, { status: 404 });
    }

    await (prisma as any).companyAsset.delete({ where: { id } });

    if (asset.s3Key) {
      try {
        await deleteFromS3(asset.s3Key);
      } catch (s3Err) {
        console.error("S3 delete failed for key", asset.s3Key, s3Err);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: "Failed to delete asset", details: message }, { status: 500 });
  }
}
