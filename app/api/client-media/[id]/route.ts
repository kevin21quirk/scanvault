import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db";
import { authOptions } from "@/lib/auth";
import { deleteFromS3 } from "@/lib/s3";

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
    const media = await (prisma as any).clientMedia.findUnique({ where: { id } });
    if (!media) return NextResponse.json({ error: "Not found" }, { status: 404 });

    await (prisma as any).clientMedia.delete({ where: { id } });

    try {
      await deleteFromS3(media.s3Key);
    } catch (s3Err) {
      console.error("S3 delete failed for key", media.s3Key, s3Err);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: "Failed to delete media", details: message }, { status: 500 });
  }
}
