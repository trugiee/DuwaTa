"use client";

import React, { useState } from "react";
import Link from "next/link";
import styles from "@/frontend/styles/tournamentDetail.module.css";
import { formatDate } from "@/frontend/lib/utils";
import { BracketViewer, BracketMatch } from "@/frontend/components/bracket/BracketViewer";

interface TournamentDetailClientProps {
  tournament: any;
}

export function TournamentDetailClient({ tournament }: TournamentDetailClientProps) {
  const [activeTab, setActiveTab] = useState<
    "overview" | "teams" | "bracket" | "matches" | "standings"
  >("overview");

  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(
    tournament.categories[0]?.id || ""
  );

  const getStatusBadge = (tStatus: string) => {
    switch (tStatus) {
      case "OPEN":
        return <span className={`${styles.statusBadge} ${styles.statusOpen}`}>Registration Open</span>;
      case "ONGOING":
        return <span className={`${styles.statusBadge} ${styles.statusOngoing}`}>Matches Ongoing</span>;
      case "COMPLETED":
        return <span className={`${styles.statusBadge} ${styles.statusCompleted}`}>Completed</span>;
      default:
        return <span className={`${styles.statusBadge}`}>{tStatus}</span>;
    }
  };

  // Filter registrations for selected category
  const categoryRegistrations = tournament.registrations.filter(
    (r: any) => r.categoryId === selectedCategoryId && r.status === "APPROVED"
  );

  // Filter matches for selected category
  const categoryMatches: BracketMatch[] = tournament.matches.filter(
    (m: any) => m.categoryId === selectedCategoryId
  );

  // Check if there is a final match completed in selected category
  const finalMatch = [...categoryMatches]
    .sort((a, b) => b.round - a.round)[0];

  const categoryChampion =
    finalMatch && finalMatch.status === "COMPLETED" && finalMatch.winnerTeamId
      ? categoryRegistrations.find(
          (r: any) => r.team.id === finalMatch.winnerTeamId
        )?.team
      : null;

  return (
    <>
      <div className={styles.banner}>
        <div className={styles.bannerContent}>
          <Link href="/tournaments" className={styles.backLink}>
             Back to All Tournaments
          </Link>

          <div className={styles.headerRow}>
            <div className={styles.titleArea}>
              <div className={styles.statusRow}>
                {getStatusBadge(tournament.status)}
                <span style={{ color: "var(--text-tertiary)", fontSize: "0.85rem" }}>
                  Official Event
                </span>
              </div>
              <h1 className={styles.title}>{tournament.name}</h1>
              <div className={styles.quickStats}>
                <div className={styles.statItem}>
                  <span>{tournament.location}</span>
                </div>
                <div className={styles.statItem}>
                  <span>
                    {formatDate(tournament.startDate)} – {formatDate(tournament.endDate)}
                  </span>
                </div>
                <div className={styles.statItem}>
                  <span>Deadline: {formatDate(tournament.registrationDeadline)}</span>
                </div>
                <div className={styles.statItem}>
                  <span>{tournament.registrations.filter((r: any) => r.status === "APPROVED").length} Teams Confirmed</span>
                </div>
              </div>
            </div>

            {tournament.status === "OPEN" && (
              <Link
                href={`/dashboard/tournaments?register=${tournament.id}`}
                className={styles.registerActionBtn}
              >
                Register Your Team
              </Link>
            )}
          </div>
        </div>

        <div className={styles.tabsBar}>
          <button
            onClick={() => setActiveTab("overview")}
            className={`${styles.tabBtn} ${activeTab === "overview" ? styles.activeTabBtn : ""}`}
          >
             Overview & Rules
          </button>
          <button
            onClick={() => setActiveTab("teams")}
            className={`${styles.tabBtn} ${activeTab === "teams" ? styles.activeTabBtn : ""}`}
          >
             Teams ({tournament.registrations.filter((r: any) => r.status === "APPROVED").length})
          </button>
          <button
            onClick={() => setActiveTab("bracket")}
            className={`${styles.tabBtn} ${activeTab === "bracket" ? styles.activeTabBtn : ""}`}
          >
             Live Brackets
          </button>
          <button
            onClick={() => setActiveTab("matches")}
            className={`${styles.tabBtn} ${activeTab === "matches" ? styles.activeTabBtn : ""}`}
          >
             Match Schedule & Scores
          </button>
          <button
            onClick={() => setActiveTab("standings")}
            className={`${styles.tabBtn} ${activeTab === "standings" ? styles.activeTabBtn : ""}`}
          >
             Champions & Standings
          </button>
        </div>
      </div>

      <div className={styles.contentWrapper}>
        {/* Category Selector for tabs that need category context */}
        {activeTab !== "overview" && tournament.categories.length > 0 && (
          <div className={styles.categorySelectRow}>
            <span style={{ fontSize: "0.85rem", color: "var(--text-tertiary)", fontWeight: 600 }}>
              Category:
            </span>
            {tournament.categories.map((c: any) => (
              <button
                key={c.id}
                onClick={() => setSelectedCategoryId(c.id)}
                className={`${styles.catBtn} ${
                  selectedCategoryId === c.id ? styles.activeCatBtn : ""
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        )}

        {/* Tab 1: Overview */}
        {activeTab === "overview" && (
          <div>
            <div className={styles.sectionCard}>
              <h2 className={styles.sectionTitle}>Tournament Information</h2>
              <p className={styles.overviewText}>
                {tournament.description ||
                  "Welcome to the official tournament page. Check category rosters and bracket progressions in real-time."}
              </p>
            </div>

            <div className={styles.sectionCard}>
              <h2 className={styles.sectionTitle}>Categories Offered</h2>
              <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                {tournament.categories.map((c: any) => (
                  <div
                    key={c.id}
                    style={{
                      background: "rgba(var(--rgb-veil), 0.05)",
                      padding: "0.75rem 1.25rem",
                      borderRadius: "8px",
                      border: "1px solid rgba(var(--rgb-veil), 0.08)",
                    }}
                  >
                    <strong style={{ color: "var(--text-primary)" }}>{c.name}</strong>
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.sectionCard}>
              <h2 className={styles.sectionTitle}>Rules & Regulations</h2>
              <ul style={{ color: "var(--text-secondary)", lineHeight: "1.8", paddingLeft: "1.25rem" }}>
                <li>Standard USA Pickleball / International Pickleball Federation tournament rules apply.</li>
                <li>Single-elimination format with seeding generated upon registration closure.</li>
                <li>Teams must report to their assigned court 15 minutes before scheduled match time.</li>
                <li>Points are played to 11, win by 2 (or 15 for finals, as designated by organizers).</li>
              </ul>
            </div>
          </div>
        )}

        {/* Tab 2: Teams */}
        {activeTab === "teams" && (
          <div className={styles.sectionCard}>
            <h2 className={styles.sectionTitle}>
              Confirmed Teams for {tournament.categories.find((c: any) => c.id === selectedCategoryId)?.name || "Category"}
            </h2>
            {categoryRegistrations.length === 0 ? (
              <p style={{ color: "var(--text-tertiary)" }}>No approved teams registered for this category yet.</p>
            ) : (
              <div className={styles.tableWrapper}>
                <table className={styles.customTable}>
                  <thead>
                    <tr>
                      <th>Team Name</th>
                      <th>Manager</th>
                      <th>Location</th>
                      <th>Registration Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categoryRegistrations.map((r: any) => (
                      <tr key={r.id}>
                        <td>
                          <strong>{r.team.teamName}</strong>
                        </td>
                        <td>{r.team.managerName}</td>
                        <td>{r.team.location || "—"}</td>
                        <td>{formatDate(r.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Bracket */}
        {activeTab === "bracket" && (
          <div className={styles.sectionCard}>
            <h2 className={styles.sectionTitle}>
              Elimination Bracket: {tournament.categories.find((c: any) => c.id === selectedCategoryId)?.name}
            </h2>
            <BracketViewer matches={categoryMatches} />
          </div>
        )}

        {/* Tab 4: Matches & Schedule */}
        {activeTab === "matches" && (
          <div className={styles.sectionCard}>
            <h2 className={styles.sectionTitle}>
              Match Schedule & Scores: {tournament.categories.find((c: any) => c.id === selectedCategoryId)?.name}
            </h2>
            {categoryMatches.length === 0 ? (
              <p style={{ color: "var(--text-tertiary)" }}>No matches scheduled yet for this category.</p>
            ) : (
              <div className={styles.tableWrapper}>
                <table className={styles.customTable}>
                  <thead>
                    <tr>
                      <th>Match</th>
                      <th>Round</th>
                      <th>Team 1</th>
                      <th>Score</th>
                      <th>Team 2</th>
                      <th>Court</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categoryMatches.map((m: any) => (
                      <tr key={m.id}>
                        <td>#{m.matchNumber}</td>
                        <td>Round {m.round}</td>
                        <td>
                          <strong>{m.teamA?.teamName || "TBD"}</strong>
                        </td>
                        <td>
                          <span style={{ fontWeight: 800, color: "var(--accent-color, #bebebe)" }}>
                            {m.scoreA !== null && m.scoreB !== null ? `${m.scoreA} - ${m.scoreB}` : "vs"}
                          </span>
                        </td>
                        <td>
                          <strong>{m.teamB?.teamName || "TBD"}</strong>
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
                                  : m.status === "ONGOING"
                                  ? "rgba(var(--rgb-tint-2), 0.2)"
                                  : "rgba(var(--rgb-veil), 0.08)",
                              color:
                                m.status === "COMPLETED"
                                  ? "var(--text-tertiary)"
                                  : m.status === "ONGOING"
                                  ? "var(--text-tertiary)"
                                  : "var(--text-secondary)",
                            }}
                          >
                            {m.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 5: Champions & Standings */}
        {activeTab === "standings" && (
          <div>
            {categoryChampion && (
              <div className={styles.championBanner}>
                <div>
                  <div style={{ color: "var(--text-secondary)", fontWeight: 700, fontSize: "0.85rem", textTransform: "uppercase" }}>
                    Category Champion
                  </div>
                  <div className={styles.championTitle}>
                    {categoryChampion.teamName}
                  </div>
                  <div style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>
                    Managed by {categoryChampion.managerName} • {categoryChampion.location || ""}
                  </div>
                </div>
              </div>
            )}

            <div className={styles.sectionCard}>
              <h2 className={styles.sectionTitle}>
                Category Standings & Results: {tournament.categories.find((c: any) => c.id === selectedCategoryId)?.name}
              </h2>
              <div className={styles.tableWrapper}>
                <table className={styles.customTable}>
                  <thead>
                    <tr>
                      <th>Team</th>
                      <th>Manager</th>
                      <th>Location</th>
                      <th>Tournament Result</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categoryRegistrations.map((r: any) => {
                      const isChamp = categoryChampion?.id === r.team.id;
                      return (
                        <tr key={r.id}>
                          <td>
                            <strong>{r.team.teamName}</strong> {isChamp && ""}
                          </td>
                          <td>{r.team.managerName}</td>
                          <td>{r.team.location || "—"}</td>
                          <td>
                            <span style={{ color: isChamp ? "var(--text-secondary)" : "var(--text-tertiary)", fontWeight: isChamp ? 800 : 500 }}>
                              {isChamp ? "Champion (1st Place)" : "Participant"}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
