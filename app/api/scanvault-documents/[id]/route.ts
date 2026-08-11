import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db";
import { authOptions } from "@/lib/auth";
import { getPresignedDownloadUrl, deleteFromS3 } from "@/lib/s3";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "ACCOUNTANT")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const doc = await (prisma as any).scanVaultDocument.findUnique({ where: { id } });

    if (!doc) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    if (doc.s3Key) {
      const url = await getPresignedDownloadUrl(doc.s3Key, doc.originalName, 300);
      return NextResponse.json({ url, filename: doc.originalName, mimeType: doc.mimeType });
    }

    if (doc.fileUrl) {
      return NextResponse.json({ url: doc.fileUrl, filename: doc.title, mimeType: doc.mimeType });
    }

    return NextResponse.json({ error: "No file associated with this document" }, { status: 404 });
  } catch (error) {
    console.error("Error fetching ScanVault document URL:", error);
    return NextResponse.json({ error: "Failed to get document URL" }, { status: 500 });
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

    const doc = await (prisma as any).scanVaultDocument.findUnique({ where: { id } });
    if (!doc) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    // Delete DB record first — if this fails, S3 object is untouched
    await (prisma as any).scanVaultDocument.delete({ where: { id } });

    // Delete S3 object after successful DB deletion
    if (doc.s3Key) {
      try {
        await deleteFromS3(doc.s3Key);
      } catch (s3Err) {
        // Log but do not fail — DB record is gone, S3 orphan is a minor cost issue
        console.error("S3 delete failed for key", doc.s3Key, s3Err);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting ScanVault document:", error);
    return NextResponse.json({ error: "Failed to delete document" }, { status: 500 });
  }
}
