import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/backend/lib/auth";
import { prisma } from "@/backend/lib/prisma";

// GET /api/teams - List teams (admin: all, team: own)
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role === "ADMIN") {
      const teams = await prisma.team.findMany({
        include: {
          user: { select: { email: true } },
          _count: { select: { players: true, registrations: true } },
        },
        orderBy: { createdAt: "desc" },
      });
      return NextResponse.json(teams);
    }

    // Team user: return own team
    const team = await prisma.team.findUnique({
      where: { userId: session.user.id },
      include: {
        user: { select: { email: true } },
        players: { orderBy: { createdAt: "asc" } },
        _count: { select: { players: true, registrations: true } },
      },
    });

    if (!team) {
      return NextResponse.json({ message: "Team not found" }, { status: 404 });
    }

    return NextResponse.json(team);
  } catch (error) {
    console.error("Error fetching teams:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/teams - Update own team profile
export async function PUT(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "TEAM") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { teamName, managerName, phone, location, logo } = body;

    const team = await prisma.team.update({
      where: { userId: session.user.id },
      data: {
        ...(teamName && { teamName }),
        ...(managerName && { managerName }),
        ...(phone !== undefined && { phone }),
        ...(location !== undefined && { location }),
        ...(logo !== undefined && { logo }),
      },
    });

    return NextResponse.json(team);
  } catch (error) {
    console.error("Error updating team:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
