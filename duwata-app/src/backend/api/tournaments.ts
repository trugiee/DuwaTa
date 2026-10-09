import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/backend/lib/auth";
import { prisma } from "@/backend/lib/prisma";

// GET /api/tournaments - List all tournaments (public)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    const where: any = {};
    if (status) {
      where.status = status.toUpperCase();
    }

    const tournaments = await prisma.tournament.findMany({
      where,
      include: {
        categories: true,
        _count: {
          select: {
            registrations: {
              where: { status: "APPROVED" },
            },
          },
        },
      },
      orderBy: { startDate: "asc" },
    });

    return NextResponse.json(tournaments);
  } catch (error) {
    console.error("Error fetching tournaments:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/tournaments - Create tournament (admin only)
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const {
      name,
      description,
      location,
      startDate,
      endDate,
      registrationDeadline,
      status,
      categories,
    } = body;

    // Validation
    if (!name || !location || !startDate || !endDate || !registrationDeadline) {
      return NextResponse.json(
        { message: "Required fields: name, location, startDate, endDate, registrationDeadline" },
        { status: 400 }
      );
    }

    const tournament = await prisma.tournament.create({
      data: {
        name,
        description: description || null,
        location,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        registrationDeadline: new Date(registrationDeadline),
        status: status || "DRAFT",
        categories: categories?.length
          ? {
              create: categories.map((cat: string) => ({ name: cat })),
            }
          : undefined,
      },
      include: {
        categories: true,
      },
    });

    return NextResponse.json(tournament, { status: 201 });
  } catch (error) {
    console.error("Error creating tournament:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
