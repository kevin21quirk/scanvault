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

    let invoices;
    
    if (session.user.role === "ADMIN") {
      invoices = await prisma.invoice.findMany({
        include: {
          user: {
            select: {
              email: true,
              name: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    } else {
      invoices = await prisma.invoice.findMany({
        where: {
          userId: session.user.id,
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    }

    return NextResponse.json(invoices);
  } catch (error) {
    console.error("Error fetching invoices:", error);
    return NextResponse.json({ error: "Failed to fetch invoices" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { userId, invoiceNumber, subtotal, vatRate, description, items, issueDate, dueDate, notes } = body;

    if (!userId || !invoiceNumber || !subtotal || !description || !issueDate || !dueDate) {
      return NextResponse.json(
        { error: "All required fields must be provided" },
        { status: 400 }
      );
    }

    // Check if invoice number already exists
    const existingInvoice = await prisma.invoice.findUnique({
      where: { invoiceNumber },
    });

    if (existingInvoice) {
      return NextResponse.json(
        { error: "Invoice number already exists" },
        { status: 400 }
      );
    }

    // Calculate VAT
    const subtotalAmount = parseFloat(subtotal);
    const vat = parseFloat(vatRate || "20.0");
    const vatAmount = (subtotalAmount * vat) / 100;
    const total = subtotalAmount + vatAmount;

    const invoice = await prisma.invoice.create({
      data: {
        userId,
        invoiceNumber,
        subtotal: subtotalAmount,
        vatRate: vat,
        vatAmount,
        total,
        description,
        items: items || null,
        issueDate: new Date(issueDate),
        dueDate: new Date(dueDate),
        notes: notes || null,
        status: "PENDING",
      },
      include: {
        user: {
          select: {
            email: true,
            name: true,
            companyName: true,
          },
        },
      },
    });

    return NextResponse.json(invoice, { status: 201 });
  } catch (error) {
    console.error("Error creating invoice:", error);
    return NextResponse.json({ error: "Failed to create invoice" }, { status: 500 });
  }
}
