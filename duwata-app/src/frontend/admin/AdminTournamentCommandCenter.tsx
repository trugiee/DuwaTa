"use client";

import React, { useState } from "react";
import Link from "next/link";
import styles from "@/frontend/styles/admin.module.css";
import { formatDate } from "@/frontend/lib/utils";
import { BracketViewer, BracketMatch } from "@/frontend/components/bracket/BracketViewer";

interface Category {
  id: string;
  name: string;
}

interface Registration {
  id: string;
  tournamentId: string;
  categoryId: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
  team: {
    id: string;
    teamName: string;
    managerName: string;
    location?: string | null;
  };
}

interface Match extends BracketMatch {
  categoryId: string;
}

interface Tournament {
  id: string;
  name: string;
  description?: string | null;
  location: string;
  startDate: string;
  endDate: string;
  registrationDeadline: string;
  status: string;
  categories: Category[];
  registrations: Registration[];
  matches: Match[];
}

export function AdminTournamentCommandCenter({
  initialTournament,
}: {
  initialTournament: Tournament;
}) {
  const [tournament, setTournament] = useState<Tournament>(initialTournament);
  const [activeTab, setActiveTab] = useState<
    "bracket" | "registrations" | "categories" | "matches"
  >("bracket");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(
    tournament.categories[0]?.id || ""
  );

  // Modals & form state
  const [showAddCatModal, setShowAddCatModal] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [generatingBracket, setGeneratingBracket] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<BracketMatch | null>(null);
  const [scoreForm, setScoreForm] = useState({
    scoreA: "",
    scoreB: "",
    court: "",
    scheduledAt: "",
    status: "SCHEDULED",
  });
  const [savingMatch, setSavingMatch] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(
    null
  );

  const reloadTournament = async () => {
    try {
      const res = await fetch(`/api/tournaments/${tournament.id}`);
      if (res.ok) {
        const data = await res.json();
        setTournament(data);
      }
    } catch (err) {
      console.error("Error reloading tournament:", err);
    }
  };

  // Status changer
  const handleStatusChange = async (newStatus: string) => {
    try {
      const res = await fetch(`/api/tournaments/${tournament.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setTournament({ ...tournament, status: newStatus });
      }
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  // Add Category
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    try {
      const res = await fetch(`/api/tournaments/${tournament.id}/categories`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newCatName.trim() }),
      });

      if (res.ok) {
        setNewCatName("");
        setShowAddCatModal(false);
        reloadTournament();
      } else {
        alert("Failed to add category");
      }
    } catch (err) {
      console.error("Error adding category:", err);
    }
  };

  // Approve / Reject Registration
  const handleRegStatus = async (regId: string, status: "APPROVED" | "REJECTED") => {
    try {
      const res = await fetch(`/api/registrations/${regId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (res.ok) {
        reloadTournament();
      } else {
        alert("Failed to update registration status");
      }
    } catch (err) {
      console.error("Error updating registration:", err);
    }
  };

  // Generate Bracket
  const handleGenerateBracket = async () => {
    const approvedCount = tournament.registrations.filter(
      (r) => r.categoryId === selectedCategoryId && r.status === "APPROVED"
    ).length;

    if (approvedCount < 2) {
      alert("At least 2 approved teams are required to generate an elimination bracket.");
      return;
    }

    if (
      !confirm(
        `Generate elimination bracket with ${approvedCount} approved teams? Existing matches for this category will be regenerated.`
      )
    ) {
      return;
    }

    setGeneratingBracket(true);
    setMessage(null);

    try {
      const res = await fetch("/api/brackets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tournamentId: tournament.id,
          categoryId: selectedCategoryId,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to generate bracket");
      }

      setMessage({ text: "Bracket generated successfully!", type: "success" });
      reloadTournament();
    } catch (err: any) {
      setMessage({ text: err.message, type: "error" });
    } finally {
      setGeneratingBracket(false);
    }
  };

  // Open Score/Schedule Match Modal
  const openMatchModal = (m: BracketMatch) => {
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

  // Save Match Score / Court
  const handleSaveMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMatch) return;

    setSavingMatch(true);

    try {
      const body: any = {
        matchId: selectedMatch.id,
        court: scoreForm.court || null,
        scheduledAt: scoreForm.scheduledAt ? new Date(scoreForm.scheduledAt).toISOString() : null,
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
        const error = await res.json();
        throw new Error(error.message || "Failed to update match");
      }

      setSelectedMatch(null);
      reloadTournament();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSavingMatch(false);
    }
  };

  // Filter category data
  const currentCategory = tournament.categories.find(
    (c) => c.id === selectedCategoryId
  );
  const categoryRegistrations = tournament.registrations.filter(
    (r) => r.categoryId === selectedCategoryId
  );
  const approvedTeamsCount = categoryRegistrations.filter(
    (r) => r.status === "APPROVED"
  ).length;
  const categoryMatches = tournament.matches.filter(
    (m) => m.categoryId === selectedCategoryId
  );

  return (
    <div>
      {/* Banner */}
      <div className={styles.headerBanner}>
        <div>
          <Link
            href="/admin/tournaments"
            style={{
              color: "var(--text-tertiary)",
              fontSize: "0.85rem",
              textDecoration: "none",
              marginBottom: "0.5rem",
              display: "inline-block",
            }}
          >
             Back to All Tournaments
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <h1 className={styles.introTitle}>{tournament.name}</h1>
            <select
              value={tournament.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              style={{
                background: "rgba(var(--rgb-grad-2), 0.8)",
                border: "1px solid rgba(var(--rgb-veil), 0.2)",
                color: "var(--text-tertiary)",
                padding: "0.3rem 0.6rem",
                borderRadius: "6px",
                fontSize: "0.8rem",
                fontWeight: 800,
              }}
            >
              <option value="DRAFT">DRAFT</option>
              <option value="OPEN">OPEN (Registration)</option>
              <option value="CLOSED">CLOSED</option>
              <option value="ONGOING">ONGOING (Tournament Live)</option>
              <option value="COMPLETED">COMPLETED</option>
            </select>
          </div>
          <p className={styles.introSub}>
             {tournament.location} •  {formatDate(tournament.startDate)} – {formatDate(tournament.endDate)}
          </p>
        </div>

        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <Link
            href={`/tournaments/${tournament.id}`}
            target="_blank"
            className={styles.secondaryBtn}
          >
             View Public Spectator Hub
          </Link>
          <button
            onClick={() => setShowAddCatModal(true)}
            className={styles.secondaryBtn}
          >
            + Add Category
          </button>
        </div>
      </div>

      {message && (
        <div
          style={{
            padding: "0.85rem 1rem",
            borderRadius: "8px",
            marginBottom: "1.5rem",
            fontSize: "0.875rem",
            background:
              message.type === "success"
                ? "rgba(var(--rgb-tint-2), 0.15)"
                : "rgba(var(--rgb-tint-3), 0.15)",
            border: `1px solid ${
              message.type === "success"
                ? "rgba(var(--rgb-tint-2), 0.3)"
                : "rgba(var(--rgb-tint-3), 0.3)"
            }`,
            color: message.type === "success" ? "var(--text-tertiary)" : "var(--text-tertiary)",
          }}
        >
          {message.text}
        </div>
      )}

      {/* Category Tabs */}
      {tournament.categories.length > 0 && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            background: "rgba(var(--rgb-grad-1), 0.5)",
            padding: "0.6rem 1rem",
            borderRadius: "10px",
            marginBottom: "1.5rem",
            border: "1px solid rgba(var(--rgb-veil), 0.06)",
            flexWrap: "wrap",
          }}
        >
          <span style={{ fontSize: "0.85rem", color: "var(--text-tertiary)", fontWeight: 700 }}>
            Active Category:
          </span>
          {tournament.categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCategoryId(c.id)}
              style={{
                background:
                  selectedCategoryId === c.id
                    ? "var(--accent-color, #bebebe)"
                    : "rgba(var(--rgb-veil), 0.05)",
                color: selectedCategoryId === c.id ? "var(--text-on-fill)" : "var(--text-secondary)",
                border: "1px solid rgba(var(--rgb-veil), 0.1)",
                padding: "0.4rem 0.85rem",
                borderRadius: "6px",
                fontWeight: 700,
                fontSize: "0.825rem",
                cursor: "pointer",
              }}
            >
              {c.name}
            </button>
          ))}
        </div>
      )}

      {/* Action Sub Tabs */}
      <div
        style={{
          display: "flex",
          gap: "0.5rem",
          marginBottom: "1.5rem",
          borderBottom: "1px solid rgba(var(--rgb-veil), 0.08)",
        }}
      >
        <button
          onClick={() => setActiveTab("bracket")}
          style={{
            background: "transparent",
            border: "none",
            borderBottom: activeTab === "bracket" ? "2px solid var(--accent-color)" : "2px solid transparent",
            color: activeTab === "bracket" ? "var(--text-tertiary)" : "var(--text-tertiary)",
            padding: "0.75rem 1.25rem",
            fontWeight: 700,
            fontSize: "0.9rem",
            cursor: "pointer",
          }}
        >
           Bracket & Live Matches ({categoryMatches.length})
        </button>

        <button
          onClick={() => setActiveTab("registrations")}
          style={{
            background: "transparent",
            border: "none",
            borderBottom:
              activeTab === "registrations" ? "2px solid var(--text-tertiary)" : "2px solid transparent",
            color: activeTab === "registrations" ? "var(--text-tertiary)" : "var(--text-tertiary)",
            padding: "0.75rem 1.25rem",
            fontWeight: 700,
            fontSize: "0.9rem",
            cursor: "pointer",
          }}
        >
           Team Approvals ({categoryRegistrations.length})
        </button>

        <button
          onClick={() => setActiveTab("matches")}
          style={{
            background: "transparent",
            border: "none",
            borderBottom: activeTab === "matches" ? "2px solid var(--accent-color)" : "2px solid transparent",
            color: activeTab === "matches" ? "var(--text-tertiary)" : "var(--text-tertiary)",
            padding: "0.75rem 1.25rem",
            fontWeight: 700,
            fontSize: "0.9rem",
            cursor: "pointer",
          }}
        >
           Court Scheduling & Scorecards
        </button>
      </div>

      {/* TAB 1: Bracket */}
      {activeTab === "bracket" && (
        <div>
          <div
            className={styles.cardSection}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "1rem",
            }}
          >
            <div>
              <h3 style={{ fontSize: "1.15rem", color: "var(--text-primary)", margin: "0 0 0.25rem" }}>
                Elimination Bracket: {currentCategory?.name || "Select Category"}
              </h3>
              <p style={{ color: "var(--text-tertiary)", fontSize: "0.85rem", margin: 0 }}>
                {approvedTeamsCount} approved teams in this division. (Min 2 required to draw). Click any match card below to enter scores or court.
              </p>
            </div>

            <button
              disabled={generatingBracket || approvedTeamsCount < 2}
              onClick={handleGenerateBracket}
              className={styles.primaryBtn}
            >
              {generatingBracket
                ? "Generating Bracket..."
                : categoryMatches.length > 0
                ? "Regenerate Bracket"
                : "Generate Elimination Bracket"}
            </button>
          </div>

          <div className={styles.cardSection}>
            <BracketViewer
              matches={categoryMatches}
              isAdmin={true}
              onMatchSelect={(m) => openMatchModal(m)}
            />
          </div>
        </div>
      )}

      {/* TAB 2: Registrations */}
      {activeTab === "registrations" && (
        <div className={styles.cardSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              Teams Registered for {currentCategory?.name}
            </h2>
            <span style={{ fontSize: "0.85rem", color: "var(--text-tertiary)", fontWeight: 700 }}>
              {approvedTeamsCount} Approved Teams
            </span>
          </div>

          {categoryRegistrations.length === 0 ? (
            <p style={{ color: "var(--text-tertiary)" }}>No teams have registered for this category yet.</p>
          ) : (
            <div className={styles.tableWrap}>
              <table className={styles.adminTable}>
                <thead>
                  <tr>
                    <th>Team Name</th>
                    <th>Manager</th>
                    <th>City / Location</th>
                    <th>Registered At</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {categoryRegistrations.map((r) => (
                    <tr key={r.id}>
                      <td>
                        <strong>{r.team.teamName}</strong>
                      </td>
                      <td>{r.team.managerName}</td>
                      <td>{r.team.location || "—"}</td>
                      <td>{formatDate(r.createdAt)}</td>
                      <td>
                        <span
                          style={{
                            fontSize: "0.72rem",
                            fontWeight: 700,
                            padding: "0.2rem 0.5rem",
                            borderRadius: "4px",
                            background:
                              r.status === "APPROVED"
                                ? "rgba(var(--rgb-tint-2), 0.15)"
                                : r.status === "PENDING"
                                ? "rgba(var(--rgb-tint), 0.15)"
                                : "rgba(var(--rgb-tint-3), 0.15)",
                            color:
                              r.status === "APPROVED"
                                ? "var(--text-tertiary)"
                                : r.status === "PENDING"
                                ? "var(--text-secondary)"
                                : "var(--text-tertiary)",
                          }}
                        >
                          {r.status}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: "0.5rem" }}>
                          {r.status !== "APPROVED" && (
                            <button
                              onClick={() => handleRegStatus(r.id, "APPROVED")}
                              className={styles.approveBtn}
                            >
                              Approve
                            </button>
                          )}
                          {r.status !== "REJECTED" && (
                            <button
                              onClick={() => handleRegStatus(r.id, "REJECTED")}
                              className={styles.rejectBtn}
                            >
                              Reject
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Matches table */}
      {activeTab === "matches" && (
        <div className={styles.cardSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              Match Scorecards: {currentCategory?.name}
            </h2>
          </div>

          {categoryMatches.length === 0 ? (
            <p style={{ color: "var(--text-tertiary)" }}>
              No matches generated yet. Go to the "Bracket" tab and click "Generate Elimination Bracket".
            </p>
          ) : (
            <div className={styles.tableWrap}>
              <table className={styles.adminTable}>
                <thead>
                  <tr>
                    <th>Match</th>
                    <th>Round</th>
                    <th>Team 1</th>
                    <th>Score</th>
                    <th>Team 2</th>
                    <th>Court</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {categoryMatches.map((m) => (
                    <tr key={m.id}>
                      <td>#{m.matchNumber}</td>
                      <td>Round {m.round}</td>
                      <td>
                        <strong>{m.teamA?.teamName || "TBD"}</strong>
                      </td>
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
                        <strong>{m.teamB?.teamName || "TBD"}</strong>
                      </td>
                      <td>{m.court || "Unassigned"}</td>
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
                          onClick={() => openMatchModal(m)}
                          className={styles.primaryBtn}
                          style={{ padding: "0.3rem 0.65rem", fontSize: "0.75rem" }}
                        >
                          Score / Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Modal: Add Category */}
      {showAddCatModal && (
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
              maxWidth: "420px",
            }}
          >
            <h3 style={{ color: "var(--text-primary)", margin: "0 0 1rem" }}>
              Add Tournament Category
            </h3>
            <form onSubmit={handleAddCategory}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Category Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mixed Doubles 40+"
                  className={styles.formInput}
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                />
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "0.75rem",
                  marginTop: "1.5rem",
                }}
              >
                <button
                  type="button"
                  onClick={() => setShowAddCatModal(false)}
                  style={{
                    background: "transparent",
                    border: "1px solid rgba(var(--rgb-veil), 0.15)",
                    color: "var(--text-secondary)",
                    padding: "0.5rem 1rem",
                    borderRadius: "8px",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className={styles.primaryBtn}>
                  Add Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Match Score Entry & Scheduling */}
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
              maxWidth: "520px",
            }}
          >
            <h3 style={{ color: "var(--text-primary)", margin: "0 0 0.5rem" }}>
              Match #{selectedMatch.matchNumber} (Round {selectedMatch.round})
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
                    <label className={styles.formLabel}>Court Assignment</label>
                    <input
                      type="text"
                      className={styles.formInput}
                      value={scoreForm.court}
                      onChange={(e) =>
                        setScoreForm({ ...scoreForm, court: e.target.value })
                      }
                      placeholder="e.g. Court 2 / Center Court"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Match Status</label>
                    <select
                      className={styles.formInput}
                      value={scoreForm.status}
                      onChange={(e) =>
                        setScoreForm({ ...scoreForm, status: e.target.value })
                      }
                    >
                      <option value="SCHEDULED">SCHEDULED</option>
                      <option value="ONGOING">ONGOING (In Play)</option>
                      <option value="COMPLETED">COMPLETED (Final)</option>
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
                  disabled={savingMatch}
                  className={styles.primaryBtn}
                  style={{ padding: "0.6rem 1.5rem" }}
                >
                  {savingMatch ? "Saving & Advancing..." : "Save Score & Advance Winner"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
