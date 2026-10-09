import { auth } from "@/backend/lib/auth";
import { prisma } from "@/backend/lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";
import styles from "@/frontend/styles/teamDashboard.module.css";
import { formatDate } from "@/frontend/lib/utils";

export default async function TeamDashboardPage() {
  const session = await auth();
  if (!session || session.user.role !== "TEAM") {
    redirect("/auth/login");
  }

  const team = await prisma.team.findUnique({
    where: { userId: session.user.id },
    include: {
      players: true,
      registrations: {
        include: {
          tournament: true,
          category: true,
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!team) {
    return <div>Team profile not found.</div>;
  }

  // Get matches involving this team
  const matches = await prisma.match.findMany({
    where: {
      OR: [{ teamAId: team.id }, { teamBId: team.id }],
    },
    include: {
      tournament: true,
      category: true,
      teamA: true,
      teamB: true,
      winnerTeam: true,
    },
    orderBy: { round: "asc" },
  });

  const scheduledCount = matches.filter((m: any) => m.status === "SCHEDULED").length;
  const completedCount = matches.filter((m: any) => m.status === "COMPLETED").length;
  const approvedRegistrations = team.registrations.filter((r: any) => r.status === "APPROVED");

  const getStatusPill = (status: string) => {
    switch (status) {
      case "APPROVED":
        return <span className={`${styles.statusPill} ${styles.statusApproved}`}>Approved</span>;
      case "PENDING":
        return <span className={`${styles.statusPill} ${styles.statusPending}`}>Pending Approval</span>;
      case "REJECTED":
        return <span className={`${styles.statusPill} ${styles.statusRejected}`}>Rejected</span>;
      default:
        return <span className={styles.statusPill}>{status}</span>;
    }
  };

  return (
    <div>
      {/* Team Banner */}
      <div className={styles.headerBanner}>
        <div className={styles.teamIntro}>
          <div className={styles.teamLogoBig}>
            {team.teamName ? team.teamName[0].toUpperCase() : "T"}
          </div>
          <div>
            <h1 className={styles.teamNameBig}>{team.teamName}</h1>
            <div className={styles.managerMeta}>
              Manager: <strong>{team.managerName}</strong> • {team.location || "Location not set"} • {team.phone || "No phone"}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: "0.75rem" }}>
          <Link href="/dashboard/players" className={styles.actionBtn}>
            + Add Players
          </Link>
          <Link href="/dashboard/tournaments" className={styles.actionBtn}>
             Register Tournament
          </Link>
        </div>
      </div>

      {/* KPI Stats */}
      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{team.players.length}</span>
            <span className={styles.statLabel}>Roster Players</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{approvedRegistrations.length}</span>
            <span className={styles.statLabel}>Active Tournaments</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{scheduledCount}</span>
            <span className={styles.statLabel}>Scheduled Matches</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{completedCount}</span>
            <span className={styles.statLabel}>Matches Played</span>
          </div>
        </div>
      </div>

      {/* Registered Tournaments Section */}
      <div className={styles.cardSection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionHeading}>Your Tournament Registrations</h2>
          <Link href="/dashboard/tournaments" className={styles.viewAllLink}>
            Browse Open Tournaments
          </Link>
        </div>

        {team.registrations.length === 0 ? (
          <div style={{ textAlign: "center", padding: "2rem", color: "var(--text-tertiary)" }}>
            <p>You haven't registered for any tournaments yet.</p>
            <Link
              href="/dashboard/tournaments"
              className={styles.actionBtn}
              style={{ marginTop: "0.75rem" }}
            >
              Explore Open Tournaments
            </Link>
          </div>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.modernTable}>
              <thead>
                <tr>
                  <th>Tournament</th>
                  <th>Category</th>
                  <th>Dates</th>
                  <th>Registration Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {team.registrations.map((r: any) => (
                  <tr key={r.id}>
                    <td>
                      <strong>{r.tournament.name}</strong>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-tertiary)" }}>
                         {r.tournament.location}
                      </div>
                    </td>
                    <td>{r.category.name}</td>
                    <td>
                      {formatDate(r.tournament.startDate)} – {formatDate(r.tournament.endDate)}
                    </td>
                    <td>{getStatusPill(r.status)}</td>
                    <td>
                      <Link
                        href={`/tournaments/${r.tournament.id}`}
                        style={{ color: "var(--text-tertiary)", fontSize: "0.85rem", fontWeight: 600 }}
                      >
                        View Bracket & Hub
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Upcoming Matches Section */}
      <div className={styles.cardSection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionHeading}>Upcoming Match Schedule</h2>
          <Link href="/dashboard/matches" className={styles.viewAllLink}>
            View All Matches
          </Link>
        </div>

        {matches.length === 0 ? (
          <div style={{ textAlign: "center", padding: "2rem", color: "var(--text-tertiary)" }}>
            <p>No matches scheduled for your team yet.</p>
            <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
              Once tournament brackets are drawn by the admin, your matchups will appear here.
            </p>
          </div>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.modernTable}>
              <thead>
                <tr>
                  <th>Match</th>
                  <th>Tournament</th>
                  <th>Category</th>
                  <th>Opponent</th>
                  <th>Court</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {matches.slice(0, 5).map((m: any) => {
                  const isTeamA = m.teamAId === team.id;
                  const opponent = isTeamA ? m.teamB : m.teamA;
                  return (
                    <tr key={m.id}>
                      <td>#{m.matchNumber} (R{m.round})</td>
                      <td>{m.tournament.name}</td>
                      <td>{m.category.name}</td>
                      <td>
                        <strong>{opponent ? opponent.teamName : "TBD / BYE"}</strong>
                      </td>
                      <td>{m.court || "TBA"}</td>
                      <td>
                        <span
                          style={{
                            fontSize: "0.75rem",
                            fontWeight: 700,
                            padding: "0.2rem 0.5rem",
                            borderRadius: "4px",
                            background:
                              m.status === "COMPLETED"
                                ? "rgba(var(--rgb-tint), 0.15)"
                                : "rgba(var(--rgb-tint-2), 0.2)",
                            color:
                              m.status === "COMPLETED" ? "var(--text-tertiary)" : "var(--text-tertiary)",
                          }}
                        >
                          {m.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
