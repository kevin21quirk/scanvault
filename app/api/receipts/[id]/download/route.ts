import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db";
import { authOptions } from "@/lib/auth";
import { generateReceiptPdf } from "@/lib/receipt-pdf";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const receipt = await prisma.receipt.findUnique({
      where: { id },
      include: {
        user: {
          select: { email: true, name: true, companyName: true, address: true },
        },
      },
    });

    if (!receipt) {
      return NextResponse.json({ error: "Receipt not found" }, { status: 404 });
    }

    if (session.user.role !== "ADMIN" && session.user.role !== "ACCOUNTANT" && receipt.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const pdfBytes = generateReceiptPdf(receipt as any);

    return new Response(pdfBytes, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${receipt.receiptNumber}.pdf"`,
      },
    });
  } catch (error) {
    console.error("Error generating receipt PDF:", error);
    return NextResponse.json({ error: "Failed to generate receipt" }, { status: 500 });
  }
}
