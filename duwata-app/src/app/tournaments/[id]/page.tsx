import { prisma } from "@/backend/lib/prisma";
import { Navbar } from "@/frontend/components/layout/Navbar";
import { notFound } from "next/navigation";
import { TournamentDetailClient } from "@/frontend/tournaments/TournamentDetailClient";
import styles from "@/frontend/styles/tournamentDetail.module.css";

export default async function TournamentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
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
    notFound();
  }

  return (
    <div className={styles.page}>
      <Navbar />
      <TournamentDetailClient tournament={tournament} />
    </div>
  );
}
