import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/backend/lib/auth";
import { prisma } from "@/backend/lib/prisma";

// GET /api/registrations - List registrations
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const tournamentId = searchParams.get("tournamentId");
    const status = searchParams.get("status");

    const where: any = {};

    if (session.user.role === "TEAM") {
      where.teamId = session.user.teamId;
    }

    if (tournamentId) {
      where.tournamentId = tournamentId;
    }

    if (status) {
      where.status = status.toUpperCase();
    }

    const registrations = await prisma.registration.findMany({
      where,
      include: {
        tournament: true,
        category: true,
        team: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(registrations);
  } catch (error) {
    console.error("Error fetching registrations:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/registrations - Register for a tournament
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user.teamId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { tournamentId, categoryId } = body;

    if (!tournamentId || !categoryId) {
      return NextResponse.json(
        { message: "Tournament and category are required" },
        { status: 400 }
      );
    }

    // Check tournament exists and is open
    const tournament = await prisma.tournament.findUnique({
      where: { id: tournamentId },
    });

    if (!tournament) {
      return NextResponse.json(
        { message: "Tournament not found" },
        { status: 404 }
      );
    }

    if (tournament.status !== "OPEN") {
      return NextResponse.json(
        { message: "Tournament is not open for registration" },
        { status: 400 }
      );
    }

    if (new Date() > tournament.registrationDeadline) {
      return NextResponse.json(
        { message: "Registration deadline has passed" },
        { status: 400 }
      );
    }

    // Check if already registered for this category
    const existing = await prisma.registration.findUnique({
      where: {
        tournamentId_categoryId_teamId: {
          tournamentId,
          categoryId,
          teamId: session.user.teamId,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { message: "Already registered for this category" },
        { status: 409 }
      );
    }

    const registration = await prisma.registration.create({
      data: {
        tournamentId,
        categoryId,
        teamId: session.user.teamId,
        status: "PENDING",
      },
      include: {
        tournament: true,
        category: true,
        team: true,
      },
    });

    return NextResponse.json(registration, { status: 201 });
  } catch (error) {
    console.error("Error creating registration:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
