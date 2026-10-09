import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/backend/lib/auth";
import { prisma } from "@/backend/lib/prisma";

// GET /api/matches - List matches
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const tournamentId = searchParams.get("tournamentId");
    const categoryId = searchParams.get("categoryId");
    const status = searchParams.get("status");

    const where: any = {};
    if (tournamentId) where.tournamentId = tournamentId;
    if (categoryId) where.categoryId = categoryId;
    if (status) where.status = status.toUpperCase();

    // If team user, filter to their matches
    const session = await auth();
    if (session?.user.role === "TEAM" && session.user.teamId) {
      where.OR = [
        { teamAId: session.user.teamId },
        { teamBId: session.user.teamId },
      ];
    }

    const matches = await prisma.match.findMany({
      where,
      include: {
        tournament: true,
        category: true,
        teamA: true,
        teamB: true,
        winnerTeam: true,
      },
      orderBy: [{ round: "asc" }, { matchNumber: "asc" }],
    });

    return NextResponse.json(matches);
  } catch (error) {
    console.error("Error fetching matches:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH /api/matches - Update match result (admin only)
export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { matchId, scoreA, scoreB, court, scheduledAt, status } = body;

    if (!matchId) {
      return NextResponse.json(
        { message: "Match ID is required" },
        { status: 400 }
      );
    }

    const match = await prisma.match.findUnique({
      where: { id: matchId },
    });

    if (!match) {
      return NextResponse.json(
        { message: "Match not found" },
        { status: 404 }
      );
    }

    const updateData: any = {};

    if (court !== undefined) updateData.court = court;
    if (scheduledAt !== undefined) updateData.scheduledAt = new Date(scheduledAt);
    if (status) updateData.status = status;

    // If scores are provided, determine winner
    if (scoreA !== undefined && scoreB !== undefined) {
      updateData.scoreA = scoreA;
      updateData.scoreB = scoreB;

      if (scoreA !== scoreB) {
        updateData.winnerTeamId = scoreA > scoreB ? match.teamAId : match.teamBId;
        updateData.status = "COMPLETED";
      }
    }

    const updatedMatch = await prisma.match.update({
      where: { id: matchId },
      data: updateData,
      include: {
        teamA: true,
        teamB: true,
        winnerTeam: true,
      },
    });

    // If match completed and has a next match, advance the winner
    if (
      updatedMatch.status === "COMPLETED" &&
      updatedMatch.winnerTeamId &&
      match.nextMatchId &&
      match.nextMatchSlot
    ) {
      const nextMatchUpdate: any = {};
      if (match.nextMatchSlot === "A") {
        nextMatchUpdate.teamAId = updatedMatch.winnerTeamId;
      } else {
        nextMatchUpdate.teamBId = updatedMatch.winnerTeamId;
      }

      await prisma.match.update({
        where: { id: match.nextMatchId },
        data: nextMatchUpdate,
      });
    }

    return NextResponse.json(updatedMatch);
  } catch (error) {
    console.error("Error updating match:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
