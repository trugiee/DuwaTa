import Link from "next/link";
import { prisma } from "@/backend/lib/prisma";
import { formatDate } from "@/frontend/lib/utils";
import { Navbar } from "@/frontend/components/layout/Navbar";
import styles from "@/frontend/styles/page.module.css";

export default async function HomePage() {
  // Fetch upcoming tournaments
  let tournaments: any[] = [];
  try {
    tournaments = await prisma.tournament.findMany({
      where: {
        status: { in: ["OPEN", "ONGOING"] },
      },
      include: {
        categories: true,
        _count: {
          select: {
            registrations: { where: { status: "APPROVED" } },
          },
        },
      },
      orderBy: { startDate: "asc" },
      take: 6,
    });
  } catch {
    // DB not connected yet — show empty state
  }

  return (
    <div className={styles.page}>
      {/* Navigation */}
      <Navbar />


      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroGlow}></div>
        <div className={styles.heroContent}>
          <div className={styles.heroBadge}> Pickleball Tournament Platform</div>
          <h1 className={styles.heroTitle}>
            <span className="text-gradient">DuwaTa</span>
          </h1>
          <p className={styles.heroSubtitle}>
            Pickleball Tournament Management Made Simple
          </p>
          <p className={styles.heroDescription}>
            Register your team, manage your roster, join tournaments, and track
            your matches and results — all in one place.
          </p>
          <div className={styles.heroActions}>
            <Link href="/tournaments" className="btn btn-primary btn-lg">
              Browse Tournaments
            </Link>
            <Link href="/auth/login" className="btn btn-secondary btn-lg">
              Team Login
            </Link>
          </div>
        </div>
        <div className={styles.heroVisual}>
          <div className={styles.heroCard}>
            <div className={styles.heroCardHeader}>
              <div className={styles.heroCardDot}></div>
              <span>Live Match</span>
            </div>
            <div className={styles.heroMatchTeams}>
              <div className={styles.heroMatchTeam}>
                <div className={styles.heroMatchAvatar}>DT</div>
                <span>DuwaTa Team</span>
                <span className={styles.heroMatchScore}>11</span>
              </div>
              <div className={styles.heroMatchVs}>VS</div>
              <div className={styles.heroMatchTeam}>
                <div className={styles.heroMatchAvatar}>SB</div>
                <span>Smash Bros</span>
                <span className={styles.heroMatchScoreLosing}>7</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Upcoming Tournaments */}
      <section className={styles.section}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionHeader}>
            <h2>Upcoming Tournaments</h2>
            <Link href="/tournaments" className="btn btn-secondary btn-sm">
              View All
            </Link>
          </div>
          {tournaments.length > 0 ? (
            <div className={`grid grid-cols-3`}>
              {tournaments.map((t) => (
                <div key={t.id} className={styles.tournamentCard}>
                  <div className={styles.tournamentCardTop}>
                    <span className={`badge ${t.status === "OPEN" ? "badge-success" : "badge-info"}`}>
                      {t.status}
                    </span>
                    <span className={styles.tournamentDate}>
                      {formatDate(t.startDate)}
                    </span>
                  </div>
                  <h3 className={styles.tournamentName}>{t.name}</h3>
                  <p className={styles.tournamentLocation}> {t.location}</p>
                  <div className={styles.tournamentCategories}>
                    {t.categories.map((c: any) => (
                      <span key={c.id} className={styles.categoryTag}>
                        {c.name}
                      </span>
                    ))}
                  </div>
                  <div className={styles.tournamentCardBottom}>
                    <span className={styles.tournamentTeams}>
                      {t._count.registrations} teams registered
                    </span>
                    <Link
                      href={`/tournaments/${t.id}`}
                      className="btn btn-secondary btn-sm"
                    >
                      View
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state-title">No upcoming tournaments</div>
              <p className="empty-state-text">
                Check back later for new tournament announcements.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* How It Works */}
      <section className={styles.section}>
        <div className={styles.sectionInner}>
          <h2 className={styles.sectionTitle}>How It Works</h2>
          <div className={`grid grid-cols-4`}>
            {[
              { step: "01", title: "Create Your Team", desc: "Register your team account and set up your profile" },
              { step: "02", title: "Register for a Tournament", desc: "Browse open tournaments and submit your registration" },
              { step: "03", title: "Play Your Matches", desc: "Check your schedule, play your matches on the court" },
              { step: "04", title: "Track Results", desc: "Follow the bracket, standings, and claim the championship" },
            ].map((item) => (
              <div key={item.step} className={styles.stepCard}>
                <div className={styles.stepNumber}>{item.step}</div>
                <h4 className={styles.stepTitle}>{item.title}</h4>
                <p className={styles.stepDesc}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.cta}>
        <div className={styles.ctaInner}>
          <h2>Ready to compete?</h2>
          <p>Create your team account and register for your first tournament today.</p>
          <Link href="/auth/register" className="btn btn-primary btn-lg">
            Register Your Team
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div className={styles.footerTop}>
            <div className={styles.footerBrand}>
              <div className={styles.logo}>
                <span className={styles.logoText}>DuwaTa</span>
              </div>
              <p className={styles.footerDesc}>
                Pickleball tournament management made simple.
              </p>
            </div>
            <div className={styles.footerLinks}>
              <div className={styles.footerColumn}>
                <h5>Platform</h5>
                <Link href="/tournaments">Tournaments</Link>
                <Link href="/auth/register">Register Team</Link>
                <Link href="/auth/login">Login</Link>
              </div>
              <div className={styles.footerColumn}>
                <h5>Support</h5>
                <a href="#">About</a>
                <a href="#">Contact</a>
                <a href="#">Help</a>
              </div>
            </div>
          </div>
          <div className={styles.footerBottom}>
            <span>© 2026 DuwaTa. All rights reserved.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
