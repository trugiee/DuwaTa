import { auth } from "@/backend/lib/auth";
import { prisma } from "@/backend/lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";
import styles from "@/frontend/styles/admin.module.css";
import { formatDate } from "@/frontend/lib/utils";
import { AdminQuickApprovals } from "@/frontend/admin/AdminQuickApprovals";

export default async function AdminOverviewPage() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    redirect("/auth/login");
  }

  // Fetch metrics in parallel
  const [
    tournamentsCount,
    teamsCount,
    pendingRegistrations,
    activeMatchesCount,
    activeTournaments,
  ] = await Promise.all([
    prisma.tournament.count(),
    prisma.team.count(),
    prisma.registration.findMany({
      where: { status: "PENDING" },
      include: {
        tournament: true,
        category: true,
        team: true,
      },
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
    prisma.match.count({
      where: { status: { in: ["SCHEDULED", "ONGOING"] } },
    }),
    prisma.tournament.findMany({
      orderBy: { startDate: "asc" },
      take: 5,
      include: {
        categories: true,
        _count: {
          select: {
            registrations: { where: { status: "APPROVED" } },
            matches: true,
          },
        },
      },
    }),
  ]);

  return (
    <div>
      {/* Banner */}
      <div className={styles.headerBanner}>
        <div>
          <h1 className={styles.introTitle}>Tournament Organizer Console</h1>
          <p className={styles.introSub}>
            Welcome back, Administrator. Manage brackets, court schedules, team registrations, and match scoring.
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.75rem" }}>
          <Link href="/admin/tournaments" className={styles.primaryBtn}>
            + Create Tournament
          </Link>
          <Link href="/admin/registrations" className={styles.secondaryBtn}>
            Review Registrations
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div>
            <div className={styles.statValue}>{tournamentsCount}</div>
            <div className={styles.statLabel}>Total Tournaments</div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div>
            <div className={styles.statValue}>{teamsCount}</div>
            <div className={styles.statLabel}>Registered Teams</div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div>
            <div
              className={styles.statValue}
              style={{ color: pendingRegistrations.length > 0 ? "var(--text-secondary)" : "var(--text-primary)" }}
            >
              {pendingRegistrations.length}
            </div>
            <div className={styles.statLabel}>Pending Approvals</div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div>
            <div className={styles.statValue}>{activeMatchesCount}</div>
            <div className={styles.statLabel}>Active / Scheduled Matches</div>
          </div>
        </div>
      </div>

      {/* Pending Approvals Quick Action Widget */}
      <div className={styles.cardSection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>
            Pending Registration Approvals ({pendingRegistrations.length})
          </h2>
          <Link
            href="/admin/registrations"
            style={{ color: "var(--text-tertiary)", fontSize: "0.85rem", fontWeight: 600 }}
          >
            All Registrations
          </Link>
        </div>

        <AdminQuickApprovals initialRegistrations={pendingRegistrations as any} />
      </div>

      {/* Recent Tournaments Command List */}
      <div className={styles.cardSection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Active Tournaments</h2>
          <Link
            href="/admin/tournaments"
            style={{ color: "var(--text-tertiary)", fontSize: "0.85rem", fontWeight: 600 }}
          >
            Manage All Tournaments
          </Link>
        </div>

        {activeTournaments.length === 0 ? (
          <p style={{ color: "var(--text-tertiary)" }}>No tournaments created yet.</p>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.adminTable}>
              <thead>
                <tr>
                  <th>Tournament Name</th>
                  <th>Status</th>
                  <th>Dates</th>
                  <th>Venue</th>
                  <th>Approved Teams</th>
                  <th>Matches</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {activeTournaments.map((t: any) => (
                  <tr key={t.id}>
                    <td>
                      <strong>{t.name}</strong>
                    </td>
                    <td>
                      <span
                        style={{
                          fontSize: "0.72rem",
                          fontWeight: 700,
                          padding: "0.2rem 0.5rem",
                          borderRadius: "4px",
                          background:
                            t.status === "OPEN"
                              ? "rgba(var(--rgb-tint-2), 0.15)"
                              : t.status === "ONGOING"
                              ? "rgba(var(--rgb-tint-2), 0.15)"
                              : "rgba(var(--rgb-veil), 0.08)",
                          color:
                            t.status === "OPEN"
                              ? "var(--text-tertiary)"
                              : t.status === "ONGOING"
                              ? "var(--text-tertiary)"
                              : "var(--text-secondary)",
                        }}
                      >
                        {t.status}
                      </span>
                    </td>
                    <td>
                      {formatDate(t.startDate)} – {formatDate(t.endDate)}
                    </td>
                    <td>{t.location}</td>
                    <td>{t._count.registrations} Teams</td>
                    <td>{t._count.matches} Matches</td>
                    <td>
                      <Link
                        href={`/admin/tournaments/${t.id}`}
                        className={styles.primaryBtn}
                        style={{ padding: "0.35rem 0.75rem", fontSize: "0.78rem" }}
                      >
                        Command Center
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
