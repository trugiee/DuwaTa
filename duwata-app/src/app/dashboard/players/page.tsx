"use client";

import React, { useState, useEffect } from "react";
import styles from "@/frontend/styles/teamDashboard.module.css";
import { formatDate } from "@/frontend/lib/utils";

interface Player {
  id: string;
  firstName: string;
  lastName: string;
  gender: "MALE" | "FEMALE";
  birthDate: string;
}

export default function PlayersRosterPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    gender: "MALE" as "MALE" | "FEMALE",
    birthDate: "1995-01-01",
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPlayers = async () => {
    try {
      const res = await fetch("/api/players");
      if (res.ok) {
        const data = await res.json();
        setPlayers(data);
      }
    } catch (err) {
      console.error("Error fetching players:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlayers();
  }, []);

  const openAddModal = () => {
    setEditingPlayer(null);
    setFormData({
      firstName: "",
      lastName: "",
      gender: "MALE",
      birthDate: "1995-01-01",
    });
    setError(null);
    setShowModal(true);
  };

  const openEditModal = (player: Player) => {
    setEditingPlayer(player);
    setFormData({
      firstName: player.firstName,
      lastName: player.lastName,
      gender: player.gender,
      birthDate: new Date(player.birthDate).toISOString().split("T")[0],
    });
    setError(null);
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const url = editingPlayer
        ? `/api/players/${editingPlayer.id}`
        : "/api/players";
      const method = editingPlayer ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to save player");
      }

      setShowModal(false);
      fetchPlayers();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove ${name} from your team roster?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/players/${id}`, { method: "DELETE" });
      if (res.ok) {
        setPlayers(players.filter((p) => p.id !== id));
      } else {
        alert("Failed to delete player");
      }
    } catch (err) {
      console.error("Error deleting player:", err);
    }
  };

  return (
    <div>
      <div className={styles.sectionHeader} style={{ marginBottom: "1.5rem" }}>
        <div>
          <h1 className={styles.sectionHeading} style={{ fontSize: "1.5rem" }}>
            Team Player Roster
          </h1>
          <p style={{ color: "var(--text-tertiary)", fontSize: "0.85rem", margin: "0.25rem 0 0" }}>
            Manage the roster of athletes representing your team in tournaments. Individual accounts are not required.
          </p>
        </div>
        <button onClick={openAddModal} className={styles.actionBtn}>
          + Add New Player
        </button>
      </div>

      <div className={styles.cardSection}>
        {loading ? (
          <div style={{ color: "var(--text-tertiary)", padding: "2rem", textAlign: "center" }}>
            Loading roster...
          </div>
        ) : players.length === 0 ? (
          <div style={{ textAlign: "center", padding: "3rem", color: "var(--text-tertiary)" }}>
            <h3>No players in roster yet</h3>
            <p style={{ fontSize: "0.9rem", margin: "0.5rem 0 1.5rem" }}>
              Add your teammates so your team is ready when registering for doubles or open categories.
            </p>
            <button onClick={openAddModal} className={styles.actionBtn}>
              + Add First Player
            </button>
          </div>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.modernTable}>
              <thead>
                <tr>
                  <th>Player Name</th>
                  <th>Gender</th>
                  <th>Date of Birth</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {players.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <strong>
                        {p.firstName} {p.lastName}
                      </strong>
                    </td>
                    <td>
                      <span
                        style={{
                          fontSize: "0.75rem",
                          fontWeight: 700,
                          padding: "0.2rem 0.5rem",
                          borderRadius: "4px",
                          background:
                            p.gender === "MALE"
                              ? "rgba(var(--rgb-tint-2), 0.15)"
                              : "rgba(var(--rgb-tint), 0.15)",
                          color: p.gender === "MALE" ? "var(--text-tertiary)" : "var(--text-tertiary)",
                        }}
                      >
                        {p.gender}
                      </span>
                    </td>
                    <td>{formatDate(p.birthDate)}</td>
                    <td>
                      <div style={{ display: "flex", gap: "0.5rem" }}>
                        <button
                          onClick={() => openEditModal(p)}
                          style={{
                            background: "rgba(var(--rgb-veil), 0.08)",
                            border: "1px solid rgba(var(--rgb-veil), 0.1)",
                            color: "var(--text-primary)",
                            padding: "0.3rem 0.65rem",
                            borderRadius: "6px",
                            cursor: "pointer",
                            fontSize: "0.78rem",
                          }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() =>
                            handleDelete(p.id, `${p.firstName} ${p.lastName}`)
                          }
                          className={styles.dangerBtn}
                        >
                          Remove
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

      {/* Modal Dialog */}
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
              maxWidth: "480px",
            }}
          >
            <h2
              style={{
                fontSize: "1.25rem",
                fontWeight: 800,
                color: "var(--text-primary)",
                marginBottom: "1rem",
              }}
            >
              {editingPlayer ? "Edit Player" : "Add Player to Roster"}
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

            <form onSubmit={handleSave}>
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>First Name *</label>
                  <input
                    type="text"
                    required
                    className={styles.formInput}
                    value={formData.firstName}
                    onChange={(e) =>
                      setFormData({ ...formData, firstName: e.target.value })
                    }
                    placeholder="e.g. Juan"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Last Name *</label>
                  <input
                    type="text"
                    required
                    className={styles.formInput}
                    value={formData.lastName}
                    onChange={(e) =>
                      setFormData({ ...formData, lastName: e.target.value })
                    }
                    placeholder="e.g. Dela Cruz"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Gender *</label>
                  <select
                    className={styles.formInput}
                    value={formData.gender}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        gender: e.target.value as "MALE" | "FEMALE",
                      })
                    }
                  >
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Birth Date *</label>
                  <input
                    type="date"
                    required
                    className={styles.formInput}
                    value={formData.birthDate}
                    onChange={(e) =>
                      setFormData({ ...formData, birthDate: e.target.value })
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
                  className={styles.saveBtn}
                  style={{ padding: "0.6rem 1.4rem" }}
                >
                  {submitting ? "Saving..." : "Save Player"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
