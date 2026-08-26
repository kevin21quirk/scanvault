import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getPresignedDownloadUrl } from "@/lib/s3";

// Public endpoint — no auth required.
// Returns a 302 redirect to a fresh presigned S3 URL so the permanent
// link /api/company-assets/[id]/file always resolves to the actual file.
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const asset = await (prisma as any).companyAsset.findUnique({
      where: { id },
      select: { s3Key: true, originalName: true, mimeType: true },
    });

    if (!asset) {
      return new NextResponse("Asset not found", { status: 404 });
    }
    if (!asset.s3Key) {
      return new NextResponse("No file associated with this asset", { status: 404 });
    }

    // Generate a fresh 1-hour presigned URL and redirect to it.
    // The public URL itself (/api/company-assets/[id]/file) is permanent.
    const url = await getPresignedDownloadUrl(
      asset.s3Key,
      asset.originalName,
      3600,
      "inline"
    );

    return NextResponse.redirect(url, { status: 302 });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Failed to serve asset:", message);
    return new NextResponse("Failed to retrieve asset", { status: 500 });
  }
}
