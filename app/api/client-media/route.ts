import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role === "ADMIN") {
      const media = await (prisma as any).clientMedia.findMany({
        orderBy: { uploadedAt: "desc" },
        include: { user: { select: { id: true, name: true, email: true, companyName: true } } },
      });
      return NextResponse.json(media);
    }

    // CLIENT: own media only
    const user = await (prisma as any).user.findUnique({
      where: { email: session.user.email! },
      select: { id: true },
    });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const media = await (prisma as any).clientMedia.findMany({
      where: { userId: user.id },
      orderBy: { uploadedAt: "desc" },
    });
    return NextResponse.json(media);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: "Failed to fetch media", details: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userId, title, description, category, s3Key, originalName, mimeType, fileSize } = await request.json();

    if (!userId) return NextResponse.json({ error: "userId is required" }, { status: 400 });
    if (!title?.trim()) return NextResponse.json({ error: "Title is required" }, { status: 400 });
    if (!s3Key) return NextResponse.json({ error: "s3Key is required" }, { status: 400 });

    const media = await (prisma as any).clientMedia.create({
      data: {
        userId,
        title: title.trim(),
        description: description?.trim() || null,
        category: category || "GENERAL",
        s3Key,
        originalName: originalName || "file",
        mimeType: mimeType || "application/octet-stream",
        fileSize: Number(fileSize) || 0,
        uploadedBy: session.user.email ?? null,
      },
      include: { user: { select: { id: true, name: true, email: true, companyName: true } } },
    });

    return NextResponse.json(media, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: "Failed to save media", details: message }, { status: 500 });
  }
}
