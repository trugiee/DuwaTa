"use client";

import React, { useState, useEffect } from "react";
import styles from "@/frontend/styles/teamDashboard.module.css";
import { formatDate } from "@/frontend/lib/utils";
import Link from "next/link";

interface Match {
  id: string;
  round: number;
  matchNumber: number;
  court?: string | null;
  scheduledAt?: string | null;
  scoreA?: number | null;
  scoreB?: number | null;
  status: "SCHEDULED" | "ONGOING" | "COMPLETED";
  winnerTeamId?: string | null;
  tournament: {
    id: string;
    name: string;
    location: string;
  };
  category: {
    id: string;
    name: string;
  };
  teamA?: {
    id: string;
    teamName: string;
  } | null;
  teamB?: {
    id: string;
    teamName: string;
  } | null;
}

export default function TeamMatchesPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"ALL" | "SCHEDULED" | "COMPLETED">("ALL");

  useEffect(() => {
    fetch("/api/matches")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setMatches(data);
        }
      })
      .catch((err) => console.error("Error fetching team matches:", err))
      .finally(() => setLoading(false));
  }, []);

  const filteredMatches = matches.filter((m) => {
    if (filter === "ALL") return true;
    return m.status === filter;
  });

  return (
    <div>
      <div className={styles.sectionHeader} style={{ marginBottom: "1.5rem" }}>
        <div>
          <h1 className={styles.sectionHeading} style={{ fontSize: "1.5rem" }}>
            Match Schedule & Results
          </h1>
          <p style={{ color: "var(--text-tertiary)", fontSize: "0.85rem", margin: "0.25rem 0 0" }}>
            Track assigned courts, times, opponents, and scorecards for your team across all tournaments.
          </p>
        </div>
      </div>

      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem" }}>
        <button
          onClick={() => setFilter("ALL")}
          className={styles.saveBtn}
          style={{
            background: filter === "ALL" ? "var(--accent-color, #bebebe)" : "rgba(var(--rgb-veil), 0.06)",
            color: filter === "ALL" ? "var(--text-on-fill)" : "var(--text-secondary)",
            padding: "0.45rem 1rem",
            fontSize: "0.85rem",
          }}
        >
          All Matches ({matches.length})
        </button>
        <button
          onClick={() => setFilter("SCHEDULED")}
          className={styles.saveBtn}
          style={{
            background: filter === "SCHEDULED" ? "var(--accent-color, #bebebe)" : "rgba(var(--rgb-veil), 0.06)",
            color: filter === "SCHEDULED" ? "var(--text-on-fill)" : "var(--text-secondary)",
            padding: "0.45rem 1rem",
            fontSize: "0.85rem",
          }}
        >
          Upcoming / Scheduled
        </button>
        <button
          onClick={() => setFilter("COMPLETED")}
          className={styles.saveBtn}
          style={{
            background: filter === "COMPLETED" ? "var(--accent-color, #bebebe)" : "rgba(var(--rgb-veil), 0.06)",
            color: filter === "COMPLETED" ? "var(--text-on-fill)" : "var(--text-secondary)",
            padding: "0.45rem 1rem",
            fontSize: "0.85rem",
          }}
        >
          Finished Matches
        </button>
      </div>

      <div className={styles.cardSection}>
        {loading ? (
          <div style={{ color: "var(--text-tertiary)", padding: "2rem", textAlign: "center" }}>
            Loading match schedule...
          </div>
        ) : filteredMatches.length === 0 ? (
          <div style={{ textAlign: "center", padding: "3rem", color: "var(--text-tertiary)" }}>
            <h3>No matches found in this view</h3>
            <p style={{ fontSize: "0.85rem", marginTop: "0.25rem" }}>
              Once tournament brackets are published and scheduled, your matches will appear here.
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
                  <th>Matchup</th>
                  <th>Court & Time</th>
                  <th>Score</th>
                  <th>Status</th>
                  <th>Bracket Hub</th>
                </tr>
              </thead>
              <tbody>
                {filteredMatches.map((m) => (
                  <tr key={m.id}>
                    <td>
                      <strong>#{m.matchNumber}</strong>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-tertiary)" }}>
                        Round {m.round}
                      </div>
                    </td>
                    <td>
                      <strong>{m.tournament.name}</strong>
                    </td>
                    <td>{m.category.name}</td>
                    <td>
                      <div>
                        <strong>{m.teamA?.teamName || "TBD"}</strong> vs{" "}
                        <strong>{m.teamB?.teamName || "TBD"}</strong>
                      </div>
                    </td>
                    <td>
                      <div> {m.court || "Court TBA"}</div>
                      {m.scheduledAt && (
                        <div style={{ fontSize: "0.75rem", color: "var(--text-tertiary)" }}>
                          {formatDate(m.scheduledAt)}
                        </div>
                      )}
                    </td>
                    <td>
                      <span
                        style={{
                          fontWeight: 800,
                          color: "var(--accent-color, #bebebe)",
                          fontSize: "0.95rem",
                        }}
                      >
                        {m.scoreA !== null && m.scoreB !== null
                          ? `${m.scoreA} – ${m.scoreB}`
                          : "vs"}
                      </span>
                    </td>
                    <td>
                      <span
                        style={{
                          fontSize: "0.72rem",
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
                    <td>
                      <Link
                        href={`/tournaments/${m.tournament.id}`}
                        style={{ color: "var(--text-tertiary)", fontSize: "0.85rem", fontWeight: 600 }}
                      >
                        View Bracket
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
