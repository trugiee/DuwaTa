import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/backend/lib/auth";
import { prisma } from "@/backend/lib/prisma";

// GET /api/tournaments/[id] - Get tournament details (public)
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const tournament = await prisma.tournament.findUnique({
      where: { id },
      include: {
        categories: true,
        registrations: {
          include: {
            team: true,
            category: true,
          },
        },
        matches: {
          include: {
            teamA: true,
            teamB: true,
            winnerTeam: true,
            category: true,
          },
          orderBy: [{ round: "asc" }, { matchNumber: "asc" }],
        },
      },
    });

    if (!tournament) {
      return NextResponse.json(
        { message: "Tournament not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(tournament);
  } catch (error) {
    console.error("Error fetching tournament:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/tournaments/[id] - Update tournament (admin only)
export async function PUT(
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
    const {
      name,
      description,
      location,
      startDate,
      endDate,
      registrationDeadline,
      status,
    } = body;

    const tournament = await prisma.tournament.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(location && { location }),
        ...(startDate && { startDate: new Date(startDate) }),
        ...(endDate && { endDate: new Date(endDate) }),
        ...(registrationDeadline && {
          registrationDeadline: new Date(registrationDeadline),
        }),
        ...(status && { status }),
      },
      include: {
        categories: true,
      },
    });

    return NextResponse.json(tournament);
  } catch (error) {
    console.error("Error updating tournament:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/tournaments/[id] - Delete tournament (admin only)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;

    await prisma.tournament.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Tournament deleted" });
  } catch (error) {
    console.error("Error deleting tournament:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
