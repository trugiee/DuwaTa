import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/backend/lib/auth";
import { prisma } from "@/backend/lib/prisma";

// PUT /api/players/[id] - Update a player
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || !session.user.teamId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Verify player belongs to this team
    const existing = await prisma.player.findUnique({ where: { id } });
    if (!existing || existing.teamId !== session.user.teamId) {
      return NextResponse.json({ message: "Player not found" }, { status: 404 });
    }

    const body = await req.json();
    const { firstName, lastName, gender, birthDate } = body;

    const player = await prisma.player.update({
      where: { id },
      data: {
        ...(firstName && { firstName }),
        ...(lastName && { lastName }),
        ...(gender && { gender }),
        ...(birthDate && { birthDate: new Date(birthDate) }),
      },
    });

    return NextResponse.json(player);
  } catch (error) {
    console.error("Error updating player:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/players/[id] - Remove a player
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || !session.user.teamId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Verify player belongs to this team
    const existing = await prisma.player.findUnique({ where: { id } });
    if (!existing || existing.teamId !== session.user.teamId) {
      return NextResponse.json({ message: "Player not found" }, { status: 404 });
    }

    await prisma.player.delete({ where: { id } });

    return NextResponse.json({ message: "Player removed" });
  } catch (error) {
    console.error("Error deleting player:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
