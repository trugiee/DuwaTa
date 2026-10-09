import { prisma } from "@/backend/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/backend/lib/auth";
import { AdminTournamentCommandCenter } from "@/frontend/admin/AdminTournamentCommandCenter";

export default async function AdminTournamentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    redirect("/auth/login");
  }

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
        orderBy: { createdAt: "asc" },
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

  return <AdminTournamentCommandCenter initialTournament={tournament as any} />;
}
