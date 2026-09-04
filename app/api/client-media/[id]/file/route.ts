import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db";
import { authOptions } from "@/lib/auth";
import { getPresignedDownloadUrl } from "@/lib/s3";

// Authenticated: admin can access any, client can only access their own.
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { id } = await params;
    const media = await (prisma as any).clientMedia.findUnique({
      where: { id },
      select: { s3Key: true, originalName: true, mimeType: true, userId: true },
    });

    if (!media) return new NextResponse("Not found", { status: 404 });

    // Clients can only access their own media
    if (session.user.role !== "ADMIN") {
      const user = await (prisma as any).user.findUnique({
        where: { email: session.user.email! },
        select: { id: true },
      });
      if (!user || user.id !== media.userId) {
        return new NextResponse("Forbidden", { status: 403 });
      }
    }

    const url = await getPresignedDownloadUrl(media.s3Key, media.originalName, 3600, "inline");
    return NextResponse.redirect(url, { status: 302 });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Failed to serve client media:", message);
    return new NextResponse("Failed to retrieve media", { status: 500 });
  }
}
