import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/backend/lib/prisma";

// POST /api/auth/register - Team Registration
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { teamName, managerName, email, phone, password, confirmPassword } = body;

    // Validation
    if (!teamName || !managerName || !email || !password || !confirmPassword) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { message: "Passwords do not match" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { message: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "Email already registered" },
        { status: 409 }
      );
    }

    // Check if team name already exists
    const existingTeam = await prisma.team.findFirst({
      where: { teamName },
    });

    if (existingTeam) {
      return NextResponse.json(
        { message: "Team name already taken" },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user and team in a transaction
    const result = await prisma.$transaction(async (tx: any) => {
      const user = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          role: "TEAM",
        },
      });

      const team = await tx.team.create({
        data: {
          userId: user.id,
          teamName,
          managerName,
          phone: phone || null,
        },
      });

      return { user, team };
    });

    return NextResponse.json(
      {
        message: "Registration successful",
        team: {
          id: result.team.id,
          teamName: result.team.teamName,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
