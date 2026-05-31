import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { quoteConfirmationHtml } from "@/lib/email-templates";

export async function POST(req: NextRequest) {
  const { name, email, phone, company, service, message } = await req.json();

  if (!name || !email || !phone || !service) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const serviceLabels: Record<string, string> = {
    "document-scanning": "Document Scanning",
    "document-archiving": "Document Archiving",
    "hr-records": "HR Records Management",
    "financial-docs": "Financial Documents",
    "client-records": "Client Records",
    "other": "Other",
  };

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
      subject: `[Quote Request] ${serviceLabels[service] ?? service} - ${name}`,
      html: `
        <h2>New Quote Request</h2>
        <table cellpadding="8" style="border-collapse:collapse; font-family:sans-serif; font-size:14px;">
          <tr><td><strong>Name</strong></td><td>${name}</td></tr>
          <tr><td><strong>Email</strong></td><td><a href="mailto:${email}">${email}</a></td></tr>
          <tr><td><strong>Phone</strong></td><td>${phone}</td></tr>
          <tr><td><strong>Company</strong></td><td>${company || "-"}</td></tr>
          <tr><td><strong>Service Required</strong></td><td>${serviceLabels[service] ?? service}</td></tr>
        </table>
        <h3 style="margin-top:20px;">Additional Information</h3>
        <p style="font-family:sans-serif; font-size:14px; white-space:pre-wrap;">${message || "-"}</p>
      `,
    }),
    // 2 — Confirmation to submitter
    transporter.sendMail({
      from: `"ScanVault" <${process.env.SMTP_USER}>`,
      to: email,
      subject: `Your free quote request has been received - ScanVault`,
      html: quoteConfirmationHtml(name, service),
    }),
  ]);

  results.forEach((r, i) => {
    const label = i === 0 ? "Kevin notification" : "Submitter confirmation";
    if (r.status === "fulfilled") console.log(`Quote email OK [${label}]:`, r.value.messageId);
    else console.error(`Quote email FAILED [${label}]:`, r.reason);
  });

  transporter.close();
  return NextResponse.json({ success: true });
}
