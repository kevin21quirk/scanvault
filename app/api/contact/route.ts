import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { contactConfirmationHtml } from "@/lib/email-templates";
import { prisma } from "@/lib/db";
import { sendWhatsApp } from "@/lib/whatsapp";

export async function POST(req: NextRequest) {
  const { name, email, phone, subject, message } = await req.json();

  if (!name || !email || !subject || !message) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
    tls: { rejectUnauthorized: false },
  });

  const results = await Promise.allSettled([
    // 1 — Internal notification to Kevin
    transporter.sendMail({
      from: `"ScanVault Website" <${process.env.SMTP_USER}>`,
      to: "kevin@scanvault.co.uk",
      replyTo: email,
      subject: `[Contact Form] ${subject}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <table cellpadding="8" style="border-collapse:collapse; font-family:sans-serif; font-size:14px;">
          <tr><td><strong>Name</strong></td><td>${name}</td></tr>
          <tr><td><strong>Email</strong></td><td><a href="mailto:${email}">${email}</a></td></tr>
          <tr><td><strong>Phone</strong></td><td>${phone || "-"}</td></tr>
          <tr><td><strong>Subject</strong></td><td>${subject}</td></tr>
        </table>
        <h3 style="margin-top:20px;">Message</h3>
        <p style="font-family:sans-serif; font-size:14px; white-space:pre-wrap;">${message}</p>
      `,
    }),
    // 2 — Confirmation to submitter
    transporter.sendMail({
      from: `"ScanVault" <${process.env.SMTP_USER}>`,
      to: email,
      subject: `We have received your message - ScanVault`,
      html: contactConfirmationHtml(name),
    }),
  ]);

  results.forEach((r, i) => {
    const label = i === 0 ? "Kevin notification" : "Submitter confirmation";
    if (r.status === "fulfilled") console.log(`Contact email OK [${label}]:`, r.value.messageId);
    else console.error(`Contact email FAILED [${label}]:`, r.reason);
  });

  transporter.close();

  const emailSent = results[1].status === "fulfilled";

  await sendWhatsApp(
    `ScanVault Contact Form\nFrom: ${name} <${email}>\nSubject: ${subject}\n${phone ? `Phone: ${phone}\n` : ""}View leads: https://scanvault.co.uk/admin`
  );

  await prisma.lead.create({
    data: { type: "CONTACT", name, email, phone: phone || null, subject, message, emailSent },
  }).catch((err: unknown) => console.error("Lead save error:", err));

  return NextResponse.json({ success: true });
}
