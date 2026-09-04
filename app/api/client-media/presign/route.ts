import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getPresignedUploadUrl, sanitiseFilename } from "@/lib/s3";
import { randomUUID } from "crypto";

const ALLOWED_TYPES = [
  "image/jpeg", "image/png", "image/webp", "image/gif", "image/heic", "image/heif",
  "video/mp4", "video/quicktime", "video/webm", "video/x-msvideo", "video/avi",
];

const MAX_BYTES = 500 * 1024 * 1024; // 500 MB

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { filename, mimeType, fileSize } = await request.json();

    if (!filename || !mimeType) {
      return NextResponse.json({ error: "filename and mimeType are required" }, { status: 400 });
    }
    if (!ALLOWED_TYPES.includes(mimeType)) {
      return NextResponse.json({ error: "Only images (JPEG, PNG, WebP, GIF, HEIC) and videos (MP4, MOV, WebM, AVI) are allowed" }, { status: 400 });
    }
    if (fileSize > MAX_BYTES) {
      return NextResponse.json({ error: "File exceeds 500 MB limit" }, { status: 400 });
    }

    const safeName = sanitiseFilename(filename);
    const s3Key = `client-media/${randomUUID()}/${safeName}`;
    const uploadUrl = await getPresignedUploadUrl(s3Key, mimeType, 600);

    return NextResponse.json({ uploadUrl, s3Key });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: "Failed to generate upload URL", details: message }, { status: 500 });
  }
}
