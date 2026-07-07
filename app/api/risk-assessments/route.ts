import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  const where = session.user.role === "ADMIN" ? {} : { userId: session.user.id };

  const assessments = await prisma.riskAssessment.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: { user: { select: { id: true, name: true, email: true } } },
  });

  return NextResponse.json(assessments);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  const body = await req.json();
  const {
    careHomeName, careHomeAddress, clientName, clientAddress,
    assessorName, workStartDate, notes, userId,
  } = body;

  if (!careHomeName || !clientName) {
    return NextResponse.json({ error: "Care home name and client name are required" }, { status: 400 });
  }

  const assessment = await prisma.riskAssessment.create({
    data: {
      careHomeName,
      careHomeAddress: careHomeAddress || null,
      clientName,
      clientAddress:   clientAddress   || null,
      assessorName:    assessorName    || "Kevin Quirk",
      workStartDate:   workStartDate   ? new Date(workStartDate) : null,
      notes:           notes           || null,
      userId:          userId          || null,
    },
    include: { user: { select: { id: true, name: true, email: true } } },
  });

  return NextResponse.json(assessment, { status: 201 });
}
