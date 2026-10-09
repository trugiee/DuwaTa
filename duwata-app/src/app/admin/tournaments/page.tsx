"use client";

import React, { useState, useEffect } from "react";
import styles from "@/frontend/styles/admin.module.css";
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
  status: "DRAFT" | "OPEN" | "CLOSED" | "ONGOING" | "COMPLETED";
  categories: Category[];
  _count?: {
    registrations: number;
    matches: number;
  };
}

export default function AdminTournamentsPage() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    location: "",
    startDate: new Date(Date.now() + 86400000 * 7).toISOString().split("T")[0],
    endDate: new Date(Date.now() + 86400000 * 9).toISOString().split("T")[0],
    registrationDeadline: new Date(Date.now() + 86400000 * 5)
      .toISOString()
      .split("T")[0],
    status: "OPEN",
    categoriesText: "Men's Doubles, Women's Doubles, Mixed Doubles",
  });

  const fetchTournaments = async () => {
    try {
      const res = await fetch("/api/tournaments");
      if (res.ok) {
        const data = await res.json();
        setTournaments(data);
      }
    } catch (err) {
      console.error("Error loading tournaments:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTournaments();
  }, []);

  const handleCreateTournament = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const categories = formData.categoriesText
      .split(",")
      .map((c) => c.trim())
      .filter(Boolean);

    try {
      const res = await fetch("/api/tournaments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          location: formData.location,
          startDate: formData.startDate,
          endDate: formData.endDate,
          registrationDeadline: formData.registrationDeadline,
          status: formData.status,
          categories,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to create tournament");
      }

      setShowModal(false);
      // Reset form
      setFormData({
        name: "",
        description: "",
        location: "",
        startDate: new Date(Date.now() + 86400000 * 7).toISOString().split("T")[0],
        endDate: new Date(Date.now() + 86400000 * 9).toISOString().split("T")[0],
        registrationDeadline: new Date(Date.now() + 86400000 * 5)
          .toISOString()
          .split("T")[0],
        status: "OPEN",
        categoriesText: "Men's Doubles, Women's Doubles, Mixed Doubles",
      });
      fetchTournaments();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/tournaments/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        fetchTournaments();
      } else {
        alert("Failed to update tournament status");
      }
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (
      !confirm(
        `Are you sure you want to delete "${name}"? All registrations, brackets, and matches will be permanently deleted.`
      )
    ) {
      return;
    }

    try {
      const res = await fetch(`/api/tournaments/${id}`, { method: "DELETE" });
      if (res.ok) {
        setTournaments(tournaments.filter((t) => t.id !== id));
      } else {
        alert("Failed to delete tournament");
      }
    } catch (err) {
      console.error("Error deleting tournament:", err);
    }
  };

  return (
    <div>
      <div className={styles.sectionHeader} style={{ marginBottom: "1.5rem" }}>
        <div>
          <h1 className={styles.sectionHeading} style={{ fontSize: "1.5rem" }}>
            Tournaments Management
          </h1>
          <p style={{ color: "var(--text-tertiary)", fontSize: "0.85rem", margin: "0.25rem 0 0" }}>
            Create new tournaments, configure divisions, publish brackets, and control event lifecycle.
          </p>
        </div>
        <button onClick={() => setShowModal(true)} className={styles.primaryBtn}>
          + Create New Tournament
        </button>
      </div>

      <div className={styles.cardSection}>
        {loading ? (
          <div style={{ color: "var(--text-tertiary)", padding: "2rem", textAlign: "center" }}>
            Loading tournaments...
          </div>
        ) : tournaments.length === 0 ? (
          <div style={{ textAlign: "center", padding: "3rem", color: "var(--text-tertiary)" }}>
            <h3>No tournaments found</h3>
            <p style={{ fontSize: "0.85rem", margin: "0.5rem 0 1.5rem" }}>
              Get started by creating your first tournament and defining categories.
            </p>
            <button
              onClick={() => setShowModal(true)}
              className={styles.primaryBtn}
            >
              + Create First Tournament
            </button>
          </div>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.adminTable}>
              <thead>
                <tr>
                  <th>Tournament</th>
                  <th>Dates & Venue</th>
                  <th>Categories</th>
                  <th>Approved Teams</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tournaments.map((t) => (
                  <tr key={t.id}>
                    <td>
                      <strong>{t.name}</strong>
                      <div
                        style={{
                          fontSize: "0.75rem",
                          color: "var(--text-tertiary)",
                          maxWidth: "280px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {t.description || "No description"}
                      </div>
                    </td>
                    <td>
                      <div>
                        {formatDate(t.startDate)} – {formatDate(t.endDate)}
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-tertiary)" }}>
                         {t.location}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: "0.3rem", flexWrap: "wrap", maxWidth: "200px" }}>
                        {t.categories.map((c) => (
                          <span
                            key={c.id}
                            style={{
                              background: "rgba(var(--rgb-veil), 0.06)",
                              fontSize: "0.7rem",
                              padding: "0.15rem 0.4rem",
                              borderRadius: "4px",
                            }}
                          >
                            {c.name}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td>
                      <strong>{t._count?.registrations || 0}</strong> teams
                    </td>
                    <td>
                      <select
                        value={t.status}
                        onChange={(e) => handleStatusChange(t.id, e.target.value)}
                        style={{
                          background: "rgba(var(--rgb-grad-2), 0.8)",
                          border: "1px solid rgba(var(--rgb-veil), 0.15)",
                          color: "var(--text-primary)",
                          padding: "0.25rem 0.5rem",
                          borderRadius: "6px",
                          fontSize: "0.78rem",
                          fontWeight: 700,
                        }}
                      >
                        <option value="DRAFT">DRAFT</option>
                        <option value="OPEN">OPEN</option>
                        <option value="CLOSED">CLOSED</option>
                        <option value="ONGOING">ONGOING</option>
                        <option value="COMPLETED">COMPLETED</option>
                      </select>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                        <Link
                          href={`/admin/tournaments/${t.id}`}
                          className={styles.primaryBtn}
                          style={{ padding: "0.35rem 0.75rem", fontSize: "0.78rem" }}
                        >
                          Command Center
                        </Link>
                        <button
                          onClick={() => handleDelete(t.id, t.name)}
                          style={{
                            background: "rgba(var(--rgb-tint-3), 0.1)",
                            border: "1px solid rgba(var(--rgb-line), 0.2)",
                            color: "var(--text-tertiary)",
                            padding: "0.35rem 0.6rem",
                            borderRadius: "6px",
                            fontSize: "0.75rem",
                            cursor: "pointer",
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Dialog: Create Tournament */}
      {showModal && (
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
              maxWidth: "600px",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            <h2
              style={{
                fontSize: "1.35rem",
                fontWeight: 800,
                color: "var(--text-primary)",
                marginBottom: "1rem",
              }}
            >
              Create New Tournament
            </h2>

            {error && (
              <div
                style={{
                  background: "rgba(var(--rgb-tint-3), 0.15)",
                  border: "1px solid rgba(var(--rgb-line), 0.3)",
                  color: "var(--text-tertiary)",
                  padding: "0.6rem 0.8rem",
                  borderRadius: "6px",
                  fontSize: "0.85rem",
                  marginBottom: "1rem",
                }}
              >
                {error}
              </div>
            )}

            <form onSubmit={handleCreateTournament}>
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Tournament Name *</label>
                  <input
                    type="text"
                    required
                    className={styles.formInput}
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="e.g. Dapitan Pickleball Summer Open 2026"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Description</label>
                  <textarea
                    rows={2}
                    className={styles.formInput}
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Brief description, rules, entry details..."
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Venue / Location *</label>
                  <input
                    type="text"
                    required
                    className={styles.formInput}
                    value={formData.location}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                    placeholder="e.g. Dapitan City Sports Center, Court 1-4"
                  />
                </div>

                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Start Date *</label>
                    <input
                      type="date"
                      required
                      className={styles.formInput}
                      value={formData.startDate}
                      onChange={(e) =>
                        setFormData({ ...formData, startDate: e.target.value })
                      }
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>End Date *</label>
                    <input
                      type="date"
                      required
                      className={styles.formInput}
                      value={formData.endDate}
                      onChange={(e) =>
                        setFormData({ ...formData, endDate: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Registration Deadline *</label>
                    <input
                      type="date"
                      required
                      className={styles.formInput}
                      value={formData.registrationDeadline}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          registrationDeadline: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Initial Status</label>
                    <select
                      className={styles.formInput}
                      value={formData.status}
                      onChange={(e) =>
                        setFormData({ ...formData, status: e.target.value })
                      }
                    >
                      <option value="DRAFT">DRAFT</option>
                      <option value="OPEN">OPEN (Accepting Teams)</option>
                    </select>
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    Categories / Divisions (comma-separated) *
                  </label>
                  <input
                    type="text"
                    required
                    className={styles.formInput}
                    value={formData.categoriesText}
                    onChange={(e) =>
                      setFormData({ ...formData, categoriesText: e.target.value })
                    }
                    placeholder="Men's Doubles, Women's Doubles, Mixed Doubles"
                  />
                  <span style={{ fontSize: "0.75rem", color: "var(--text-tertiary)" }}>
                    Separate categories with a comma. You can add more later.
                  </span>
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
                  onClick={() => setShowModal(false)}
                  style={{
                    background: "transparent",
                    border: "1px solid rgba(var(--rgb-veil), 0.15)",
                    color: "var(--text-secondary)",
                    padding: "0.6rem 1.1rem",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontSize: "0.85rem",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className={styles.primaryBtn}
                  style={{ padding: "0.6rem 1.5rem" }}
                >
                  {submitting ? "Creating..." : "Create Tournament"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
