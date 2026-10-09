"use client";

import React, { useState, useEffect } from "react";
import styles from "@/frontend/styles/teamDashboard.module.css";
import { formatDate } from "@/frontend/lib/utils";
import Link from "next/link";

interface Category {
  id: string;
  name: string;
}

interface Tournament {
  id: string;
  name: string;
  description?: string;
  location: string;
  startDate: string;
  endDate: string;
  registrationDeadline: string;
  status: string;
  categories: Category[];
}

interface Registration {
  id: string;
  tournamentId: string;
  categoryId: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  tournament: Tournament;
  category: Category;
}

export default function TeamTournamentsPage() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategories, setSelectedCategories] = useState<Record<string, string>>({});
  const [submittingTourneyId, setSubmittingTourneyId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const fetchData = async () => {
    try {
      const [tourneysRes, regsRes] = await Promise.all([
        fetch("/api/tournaments?status=OPEN"),
        fetch("/api/registrations"),
      ]);

      if (tourneysRes.ok) {
        const data = await tourneysRes.json();
        setTournaments(data);
        // Default category select
        const initialCats: Record<string, string> = {};
        data.forEach((t: Tournament) => {
          if (t.categories && t.categories.length > 0) {
            initialCats[t.id] = t.categories[0].id;
          }
        });
        setSelectedCategories(initialCats);
      }

      if (regsRes.ok) {
        const regData = await regsRes.json();
        setRegistrations(regData);
      }
    } catch (err) {
      console.error("Error loading tournament registration data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRegister = async (tournamentId: string) => {
    const categoryId = selectedCategories[tournamentId];
    if (!categoryId) {
      alert("Please select a category first.");
      return;
    }

    setSubmittingTourneyId(tournamentId);
    setMessage(null);

    try {
      const res = await fetch("/api/registrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tournamentId, categoryId }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to register team.");
      }

      setMessage({
        text: "Registration submitted successfully! Waiting for tournament director approval.",
        type: "success",
      });
      fetchData();
    } catch (err: any) {
      setMessage({ text: err.message, type: "error" });
    } finally {
      setSubmittingTourneyId(null);
    }
  };

  const getStatusBadge = (status: string) => {
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
      <div className={styles.sectionHeader} style={{ marginBottom: "1.5rem" }}>
        <div>
          <h1 className={styles.sectionHeading} style={{ fontSize: "1.5rem" }}>
            Tournament Registrations
          </h1>
          <p style={{ color: "var(--text-tertiary)", fontSize: "0.85rem", margin: "0.25rem 0 0" }}>
            Browse open tournaments, select categories to enter, and monitor registration approval statuses.
          </p>
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

      {/* Open Tournaments Available for Registration */}
      <div className={styles.cardSection}>
        <h2 className={styles.sectionHeading} style={{ marginBottom: "1rem" }}>
          Open For Team Entry
        </h2>

        {loading ? (
          <div style={{ color: "var(--text-tertiary)", padding: "1.5rem" }}>Loading tournaments...</div>
        ) : tournaments.length === 0 ? (
          <p style={{ color: "var(--text-tertiary)" }}>No tournaments are currently open for registration.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {tournaments.map((t) => {
              const myRegsForTourney = registrations.filter(
                (r) => r.tournamentId === t.id
              );
              const isDeadlinePassed = new Date() > new Date(t.registrationDeadline);

              return (
                <div
                  key={t.id}
                  style={{
                    background: "rgba(var(--rgb-grad-2), 0.6)",
                    border: "1px solid rgba(var(--rgb-veil), 0.08)",
                    borderRadius: "12px",
                    padding: "1.25rem 1.5rem",
                    display: "flex",
                    flexWrap: "wrap",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "1.25rem",
                  }}
                >
                  <div style={{ flex: "1 1 320px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                      <h3 style={{ fontSize: "1.15rem", color: "var(--text-primary)", margin: 0 }}>
                        {t.name}
                      </h3>
                      <span
                        style={{
                          fontSize: "0.7rem",
                          background: "rgba(var(--rgb-tint-2), 0.15)",
                          color: "var(--text-tertiary)",
                          padding: "0.15rem 0.5rem",
                          borderRadius: "4px",
                          fontWeight: 700,
                        }}
                      >
                        OPEN
                      </span>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        gap: "1.25rem",
                        color: "var(--text-tertiary)",
                        fontSize: "0.8rem",
                        marginTop: "0.4rem",
                        flexWrap: "wrap",
                      }}
                    >
                      <span> {t.location}</span>
                      <span>
                         {formatDate(t.startDate)} – {formatDate(t.endDate)}
                      </span>
                      <span>Deadline: {formatDate(t.registrationDeadline)}</span>
                    </div>

                    {myRegsForTourney.length > 0 && (
                      <div style={{ marginTop: "0.75rem", display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                        {myRegsForTourney.map((r) => (
                          <div
                            key={r.id}
                            style={{
                              background: "rgba(var(--rgb-veil), 0.05)",
                              padding: "0.25rem 0.6rem",
                              borderRadius: "6px",
                              fontSize: "0.78rem",
                              display: "flex",
                              alignItems: "center",
                              gap: "0.5rem",
                            }}
                          >
                            <span>{r.category.name}:</span>
                            {getStatusBadge(r.status)}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
                    {t.categories && t.categories.length > 0 && (
                      <select
                        className={styles.formInput}
                        style={{ width: "auto", minWidth: "160px" }}
                        value={selectedCategories[t.id] || ""}
                        onChange={(e) =>
                          setSelectedCategories({
                            ...selectedCategories,
                            [t.id]: e.target.value,
                          })
                        }
                      >
                        {t.categories.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    )}

                    <button
                      onClick={() => handleRegister(t.id)}
                      disabled={submittingTourneyId === t.id || isDeadlinePassed}
                      className={styles.saveBtn}
                      style={{ padding: "0.6rem 1.25rem" }}
                    >
                      {submittingTourneyId === t.id
                        ? "Submitting..."
                        : isDeadlinePassed
                        ? "Deadline Passed"
                        : "Register Team"}
                    </button>

                    <Link
                      href={`/tournaments/${t.id}`}
                      style={{
                        padding: "0.6rem 1rem",
                        background: "rgba(var(--rgb-veil), 0.06)",
                        border: "1px solid rgba(var(--rgb-veil), 0.1)",
                        borderRadius: "8px",
                        color: "var(--text-secondary)",
                        fontSize: "0.85rem",
                        textDecoration: "none",
                      }}
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Existing Registrations Table */}
      <div className={styles.cardSection}>
        <h2 className={styles.sectionHeading} style={{ marginBottom: "1rem" }}>
          Registration Status & History
        </h2>

        {registrations.length === 0 ? (
          <p style={{ color: "var(--text-tertiary)" }}>No tournament registration history found.</p>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.modernTable}>
              <thead>
                <tr>
                  <th>Tournament</th>
                  <th>Category</th>
                  <th>Submitted Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {registrations.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <strong>{r.tournament.name}</strong>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-tertiary)" }}>
                         {r.tournament.location}
                      </div>
                    </td>
                    <td>{r.category.name}</td>
                    <td>{formatDate(r.tournament.startDate)}</td>
                    <td>{getStatusBadge(r.status)}</td>
                    <td>
                      <Link
                        href={`/tournaments/${r.tournament.id}`}
                        style={{ color: "var(--text-tertiary)", fontSize: "0.85rem", fontWeight: 600 }}
                      >
                        Open Bracket Hub
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
