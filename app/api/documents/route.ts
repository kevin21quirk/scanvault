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

    let documents;
    
    if (session.user.role === "ADMIN") {
      documents = await prisma.document.findMany({
        include: {
          user: {
            select: {
              email: true,
              name: true,
            },
          },
        },
        orderBy: {
          uploadedAt: "desc",
        },
      });
    } else {
      documents = await prisma.document.findMany({
        where: {
          userId: session.user.id,
        },
        orderBy: {
          uploadedAt: "desc",
        },
      });
    }

    return NextResponse.json(documents);
  } catch (error) {
    console.error("Error fetching documents:", error);
    return NextResponse.json({ error: "Failed to fetch documents" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { userId, title, description, category, fileUrl, fileSize, mimeType } = body;

    if (!userId || !title || !category || !fileUrl || !fileSize || !mimeType) {
      return NextResponse.json(
        { error: "All required fields must be provided" },
        { status: 400 }
      );
    }

    const document = await prisma.document.create({
      data: {
        userId,
        title,
        description,
        category,
        fileUrl,
        fileSize: parseInt(fileSize),
        mimeType,
      },
      include: {
        user: {
          select: {
            email: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json(document, { status: 201 });
  } catch (error) {
    console.error("Error creating document:", error);
    return NextResponse.json({ error: "Failed to create document" }, { status: 500 });
  }
}
