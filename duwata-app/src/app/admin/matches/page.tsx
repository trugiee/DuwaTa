"use client";

import React, { useState, useEffect } from "react";
import styles from "@/frontend/styles/admin.module.css";
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
  };
  category: {
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

export default function AdminMatchesPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [scoreForm, setScoreForm] = useState({
    scoreA: "",
    scoreB: "",
    court: "",
    scheduledAt: "",
    status: "SCHEDULED",
  });
  const [saving, setSaving] = useState(false);

  const fetchMatches = async () => {
    try {
      const res = await fetch("/api/matches");
      if (res.ok) {
        const data = await res.json();
        setMatches(data);
      }
    } catch (err) {
      console.error("Error fetching matches:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, []);

  const openScoreModal = (m: Match) => {
    setSelectedMatch(m);
    setScoreForm({
      scoreA: m.scoreA !== null && m.scoreA !== undefined ? String(m.scoreA) : "",
      scoreB: m.scoreB !== null && m.scoreB !== undefined ? String(m.scoreB) : "",
      court: m.court || "",
      scheduledAt: m.scheduledAt
        ? new Date(m.scheduledAt).toISOString().slice(0, 16)
        : "",
      status: m.status || "SCHEDULED",
    });
  };

  const handleSaveMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMatch) return;

    setSaving(true);
    try {
      const body: any = {
        matchId: selectedMatch.id,
        court: scoreForm.court || null,
        scheduledAt: scoreForm.scheduledAt
          ? new Date(scoreForm.scheduledAt).toISOString()
          : null,
        status: scoreForm.status,
      };

      if (scoreForm.scoreA !== "" && scoreForm.scoreB !== "") {
        body.scoreA = parseInt(scoreForm.scoreA, 10);
        body.scoreB = parseInt(scoreForm.scoreB, 10);
      }

      const res = await fetch("/api/matches", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to update match");
      }

      setSelectedMatch(null);
      fetchMatches();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const filteredMatches = matches.filter((m) => {
    if (statusFilter === "ALL") return true;
    return m.status === statusFilter;
  });

  return (
    <div>
      <div className={styles.sectionHeader} style={{ marginBottom: "1.5rem" }}>
        <div>
          <h1 className={styles.sectionHeading} style={{ fontSize: "1.5rem" }}>
            Match Scoring & Scheduling Board
          </h1>
          <p style={{ color: "var(--text-tertiary)", fontSize: "0.85rem", margin: "0.25rem 0 0" }}>
            Record scores, assign court locations, and auto-advance winners across all tournament categories.
          </p>
        </div>
      </div>

      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem" }}>
        {["ALL", "SCHEDULED", "ONGOING", "COMPLETED"].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={styles.secondaryBtn}
            style={{
              background:
                statusFilter === st
                  ? "var(--accent-color, #bebebe)"
                  : "rgba(var(--rgb-veil), 0.05)",
              color: statusFilter === st ? "var(--text-on-fill)" : "var(--text-secondary)",
              fontWeight: 700,
            }}
          >
            {st === "ALL" ? "All Matches" : st}
          </button>
        ))}
      </div>

      <div className={styles.cardSection}>
        {loading ? (
          <div style={{ color: "var(--text-tertiary)", padding: "2rem", textAlign: "center" }}>
            Loading matches...
          </div>
        ) : filteredMatches.length === 0 ? (
          <div style={{ textAlign: "center", padding: "3rem", color: "var(--text-tertiary)" }}>
            <h3>No matches found</h3>
            <p style={{ fontSize: "0.85rem" }}>
              Generate tournament brackets to create match fixtures.
            </p>
          </div>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.adminTable}>
              <thead>
                <tr>
                  <th>Tournament</th>
                  <th>Category</th>
                  <th>Match</th>
                  <th>Matchup</th>
                  <th>Court</th>
                  <th>Score</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredMatches.map((m) => (
                  <tr key={m.id}>
                    <td>
                      <Link
                        href={`/admin/tournaments/${m.tournament.id}`}
                        style={{ color: "var(--text-tertiary)", fontWeight: 600 }}
                      >
                        {m.tournament.name}
                      </Link>
                    </td>
                    <td>{m.category.name}</td>
                    <td>
                      #{m.matchNumber} (R{m.round})
                    </td>
                    <td>
                      <strong>{m.teamA?.teamName || "TBD"}</strong> vs{" "}
                      <strong>{m.teamB?.teamName || "TBD"}</strong>
                    </td>
                    <td>{m.court || "Unassigned"}</td>
                    <td>
                      <span
                        style={{
                          fontWeight: 800,
                          color: "var(--accent-color, #bebebe)",
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
                              ? "rgba(var(--rgb-tint-2), 0.15)"
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
                      <button
                        onClick={() => openScoreModal(m)}
                        className={styles.primaryBtn}
                        style={{ padding: "0.3rem 0.65rem", fontSize: "0.75rem" }}
                      >
                        Enter Score / Court
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Score / Court Edit Modal */}
      {selectedMatch && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.75)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
            padding: "1rem",
          }}
        >
          <div
            style={{
              background: "var(--bg-section)",
              border: "1px solid rgba(var(--rgb-veil), 0.1)",
              borderRadius: "14px",
              padding: "2rem",
              width: "100%",
              maxWidth: "500px",
            }}
          >
            <h3 style={{ color: "var(--text-primary)", margin: "0 0 0.25rem" }}>
              Match #{selectedMatch.matchNumber} — {selectedMatch.category.name}
            </h3>
            <p style={{ color: "var(--text-tertiary)", fontSize: "0.85rem", margin: "0 0 1.25rem" }}>
              {selectedMatch.teamA?.teamName || "TBD"} vs{" "}
              {selectedMatch.teamB?.teamName || "TBD"}
            </p>

            <form onSubmit={handleSaveMatch}>
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "1rem",
                    background: "rgba(var(--rgb-grad-2), 0.6)",
                    padding: "1rem",
                    borderRadius: "10px",
                  }}
                >
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>
                      Score: {selectedMatch.teamA?.teamName || "Team A"}
                    </label>
                    <input
                      type="number"
                      min="0"
                      className={styles.formInput}
                      value={scoreForm.scoreA}
                      onChange={(e) =>
                        setScoreForm({ ...scoreForm, scoreA: e.target.value })
                      }
                      placeholder="0"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>
                      Score: {selectedMatch.teamB?.teamName || "Team B"}
                    </label>
                    <input
                      type="number"
                      min="0"
                      className={styles.formInput}
                      value={scoreForm.scoreB}
                      onChange={(e) =>
                        setScoreForm({ ...scoreForm, scoreB: e.target.value })
                      }
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Court</label>
                    <input
                      type="text"
                      className={styles.formInput}
                      value={scoreForm.court}
                      onChange={(e) =>
                        setScoreForm({ ...scoreForm, court: e.target.value })
                      }
                      placeholder="e.g. Court 1"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Status</label>
                    <select
                      className={styles.formInput}
                      value={scoreForm.status}
                      onChange={(e) =>
                        setScoreForm({ ...scoreForm, status: e.target.value })
                      }
                    >
                      <option value="SCHEDULED">SCHEDULED</option>
                      <option value="ONGOING">ONGOING</option>
                      <option value="COMPLETED">COMPLETED</option>
                    </select>
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Scheduled Time</label>
                  <input
                    type="datetime-local"
                    className={styles.formInput}
                    value={scoreForm.scheduledAt}
                    onChange={(e) =>
                      setScoreForm({ ...scoreForm, scheduledAt: e.target.value })
                    }
                  />
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "0.75rem",
                  marginTop: "1.75rem",
                }}
              >
                <button
                  type="button"
                  onClick={() => setSelectedMatch(null)}
                  style={{
                    background: "transparent",
                    border: "1px solid rgba(var(--rgb-veil), 0.15)",
                    color: "var(--text-secondary)",
                    padding: "0.6rem 1.1rem",
                    borderRadius: "8px",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className={styles.primaryBtn}
                  style={{ padding: "0.6rem 1.5rem" }}
                >
                  {saving ? "Updating..." : "Save Match"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
