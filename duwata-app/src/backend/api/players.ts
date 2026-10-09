import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/backend/lib/auth";
import { prisma } from "@/backend/lib/prisma";

// GET /api/players - List players for own team
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const teamId = session.user.teamId;
    if (!teamId) {
      return NextResponse.json({ message: "No team found" }, { status: 404 });
    }

    const players = await prisma.player.findMany({
      where: { teamId },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(players);
  } catch (error) {
    console.error("Error fetching players:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/players - Add player to own team
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user.teamId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { firstName, lastName, gender, birthDate } = body;

    if (!firstName || !lastName || !gender || !birthDate) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 }
      );
    }

    const player = await prisma.player.create({
      data: {
        teamId: session.user.teamId,
        firstName,
        lastName,
        gender,
        birthDate: new Date(birthDate),
      },
    });

    return NextResponse.json(player, { status: 201 });
  } catch (error) {
    console.error("Error creating player:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
