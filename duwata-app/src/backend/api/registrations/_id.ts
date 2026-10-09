import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/backend/lib/auth";
import { prisma } from "@/backend/lib/prisma";

// PATCH /api/registrations/[id] - Approve or reject registration (admin only)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    const { status } = body;

    if (!status || !["APPROVED", "REJECTED"].includes(status)) {
      return NextResponse.json(
        { message: "Status must be APPROVED or REJECTED" },
        { status: 400 }
      );
    }

    const registration = await prisma.registration.update({
      where: { id },
      data: { status },
      include: {
        tournament: true,
        category: true,
        team: true,
      },
    });

    return NextResponse.json(registration);
  } catch (error) {
    console.error("Error updating registration:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
