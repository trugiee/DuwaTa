import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/backend/lib/auth";
import { prisma } from "@/backend/lib/prisma";
import { generateSingleEliminationBracket } from "@/backend/lib/bracket";

// POST /api/brackets - Generate bracket for a tournament category (admin only)
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { tournamentId, categoryId } = body;

    if (!tournamentId || !categoryId) {
      return NextResponse.json(
        { message: "Tournament and category are required" },
        { status: 400 }
      );
    }

    // Get approved teams for this category
    const registrations = await prisma.registration.findMany({
      where: {
        tournamentId,
        categoryId,
        status: "APPROVED",
      },
      include: { team: true },
    });

    if (registrations.length < 2) {
      return NextResponse.json(
        { message: "Need at least 2 approved teams to generate a bracket" },
        { status: 400 }
      );
    }

    // Delete existing matches for this category (regenerate)
    await prisma.match.deleteMany({
      where: { tournamentId, categoryId },
    });

    // Generate bracket
    const teamIds = registrations.map((r: any) => r.teamId);
    const bracketMatches = generateSingleEliminationBracket(teamIds);

    // Create matches in database
    // First pass: create all matches to get IDs
    const createdMatches: any[] = [];
    for (const bm of bracketMatches) {
      const match = await prisma.match.create({
        data: {
          tournamentId,
          categoryId,
          round: bm.round,
          matchNumber: bm.matchNumber,
          teamAId: bm.teamAId,
          teamBId: bm.teamBId,
          status: "SCHEDULED",
        },
      });
      createdMatches.push({ ...match, bracketInfo: bm });
    }

    // Second pass: link next matches
    for (const cm of createdMatches) {
      const bm = cm.bracketInfo;
      if (bm.nextMatchNumber) {
        const nextMatch = createdMatches.find(
          (m) => m.bracketInfo.matchNumber === bm.nextMatchNumber
        );
        if (nextMatch) {
          await prisma.match.update({
            where: { id: cm.id },
            data: {
              nextMatchId: nextMatch.id,
              nextMatchSlot: bm.nextMatchSlot,
            },
          });
        }
      }

      // Auto-advance BYE matches
      if (bm.isBye) {
        const winnerId = bm.teamAId || bm.teamBId;
        if (winnerId) {
          await prisma.match.update({
            where: { id: cm.id },
            data: {
              winnerTeamId: winnerId,
              status: "COMPLETED",
              scoreA: bm.teamAId ? 0 : null,
              scoreB: bm.teamBId ? 0 : null,
            },
          });

          // Advance to next match
          if (bm.nextMatchNumber) {
            const nextMatch = createdMatches.find(
              (m) => m.bracketInfo.matchNumber === bm.nextMatchNumber
            );
            if (nextMatch) {
              const updateField =
                bm.nextMatchSlot === "A" ? "teamAId" : "teamBId";
              await prisma.match.update({
                where: { id: nextMatch.id },
                data: { [updateField]: winnerId },
              });
            }
          }
        }
      }
    }

    // Fetch final bracket
    const matches = await prisma.match.findMany({
      where: { tournamentId, categoryId },
      include: {
        teamA: true,
        teamB: true,
        winnerTeam: true,
      },
      orderBy: [{ round: "asc" }, { matchNumber: "asc" }],
    });

    return NextResponse.json(
      { message: "Bracket generated", matches },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error generating bracket:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
