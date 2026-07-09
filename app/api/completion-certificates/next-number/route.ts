import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  const last = await prisma.completionCertificate.findFirst({
    orderBy: { createdAt: "desc" },
    select: { certificateNumber: true },
  });

  let next = 1;
  if (last?.certificateNumber) {
    const match = last.certificateNumber.match(/(\d+)$/);
    if (match) next = parseInt(match[1]) + 1;
  }

  const certificateNumber = `CC-${String(next).padStart(4, "0")}`;
  return NextResponse.json({ certificateNumber });
}
