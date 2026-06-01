import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import nodemailer from "nodemailer";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { replyEmailHtml } from "@/lib/email-templates";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  const { id } = await params;

  const formData = await req.formData();
  const to      = formData.get("to")      as string;
  const toName  = formData.get("toName")  as string;
  const subject = formData.get("subject") as string;
  const message = formData.get("message") as string;
  const file    = formData.get("file")    as File | null;

  if (!to || !subject || !message) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const attachments: { filename: string; content: Buffer; contentType: string }[] = [];
  if (file && file.size > 0) {
    attachments.push({
      filename: file.name,
      content: Buffer.from(await file.arrayBuffer()),
      contentType: file.type || "application/octet-stream",
    });
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === "true",
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
    tls: { rejectUnauthorized: false },
  });

  await transporter.sendMail({
    from: `"Kevin Quirk - ScanVault" <${process.env.SMTP_USER}>`,
    to,
    subject,
    html: replyEmailHtml(toName || to, message),
    attachments,
  });

  transporter.close();

  const lead = await prisma.lead.update({
    where: { id },
    data: { respondedAt: new Date() },
  });

  return NextResponse.json({ success: true, lead });
}
