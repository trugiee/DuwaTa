import { prisma } from "@/backend/lib/prisma";
import { Navbar } from "@/frontend/components/layout/Navbar";
import Link from "next/link";
import styles from "@/frontend/styles/tournaments.module.css";
import { formatDate } from "@/frontend/lib/utils";

export default async function TournamentsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; search?: string }>;
}) {
  const { status, search } = await searchParams;

  const where: any = {};
  if (status && status !== "ALL") {
    where.status = status.toUpperCase();
  }
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { location: { contains: search, mode: "insensitive" } },
    ];
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

  const getStatusBadge = (tStatus: string) => {
    switch (tStatus) {
      case "OPEN":
        return <span className={`${styles.statusBadge} ${styles.statusOpen}`}>Registration Open</span>;
      case "ONGOING":
        return <span className={`${styles.statusBadge} ${styles.statusOngoing}`}>Matches Ongoing</span>;
      case "COMPLETED":
        return <span className={`${styles.statusBadge} ${styles.statusCompleted}`}>Completed</span>;
      default:
        return <span className={`${styles.statusBadge} ${styles.statusDraft}`}>{tStatus}</span>;
    }
  };

  const activeTab = status?.toUpperCase() || "ALL";

  return (
    <div className={styles.page}>
      <Navbar />

      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <span className={styles.heroTag}>DuwaTa Tournament Hub</span>
          <h1 className={styles.heroTitle}>
            Pickleball <span>Tournaments</span>
          </h1>
          <p className={styles.heroSubtitle}>
            Browse official competitions, register your team roster, view live bracket progressions, and follow match results.
          </p>
        </div>
      </section>

      <main className={styles.container}>
        <div className={styles.controlsBar}>
          <div className={styles.filterTabs}>
            <Link
              href="/tournaments"
              className={`${styles.filterTab} ${activeTab === "ALL" ? styles.activeTab : ""}`}
            >
              All
            </Link>
            <Link
              href="/tournaments?status=OPEN"
              className={`${styles.filterTab} ${activeTab === "OPEN" ? styles.activeTab : ""}`}
            >
              Open For Entry
            </Link>
            <Link
              href="/tournaments?status=ONGOING"
              className={`${styles.filterTab} ${activeTab === "ONGOING" ? styles.activeTab : ""}`}
            >
              Live / Ongoing
            </Link>
            <Link
              href="/tournaments?status=COMPLETED"
              className={`${styles.filterTab} ${activeTab === "COMPLETED" ? styles.activeTab : ""}`}
            >
              Past / Completed
            </Link>
          </div>
        </div>

        {tournaments.length === 0 ? (
          <div className={styles.emptyState}>
            <h3>No tournaments found</h3>
            <p>Check back soon or adjust your filter selection.</p>
          </div>
        ) : (
          <div className={styles.grid}>
            {tournaments.map((t: any) => (
              <div key={t.id} className={styles.card}>
                <div className={styles.cardHeader}>
                  <h3 className={styles.cardTitle}>{t.name}</h3>
                  {getStatusBadge(t.status)}
                </div>

                <p className={styles.cardDescription}>
                  {t.description || "Official tournament hosted on DuwaTa."}
                </p>

                <div className={styles.metaList}>
                  <div className={styles.metaItem}>
                    <span>{t.location}</span>
                  </div>
                  <div className={styles.metaItem}>
                    <span>
                      {formatDate(t.startDate)} – {formatDate(t.endDate)}
                    </span>
                  </div>
                  <div className={styles.metaItem}>
                    <span>
                      Deadline: {formatDate(t.registrationDeadline)}
                    </span>
                  </div>
                  <div className={styles.metaItem}>
                    <span>{t._count.registrations} Approved Teams</span>
                  </div>
                </div>

                <div className={styles.categoriesWrapper}>
                  {t.categories.map((c: any) => (
                    <span key={c.id} className={styles.categoryPill}>
                      {c.name}
                    </span>
                  ))}
                </div>

                <div className={styles.cardActions}>
                  <Link
                    href={`/tournaments/${t.id}`}
                    className={styles.secondaryBtn}
                  >
                    View Hub & Brackets
                  </Link>
                  {t.status === "OPEN" && (
                    <Link
                      href={`/dashboard/tournaments?register=${t.id}`}
                      className={styles.primaryBtn}
                    >
                      Register Team
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
