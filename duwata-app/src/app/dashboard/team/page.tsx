"use client";

import React, { useState, useEffect } from "react";
import styles from "@/frontend/styles/teamDashboard.module.css";

export default function TeamProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const [formData, setFormData] = useState({
    teamName: "",
    managerName: "",
    phone: "",
    location: "",
    logo: "",
  });

  useEffect(() => {
    fetch("/api/teams")
      .then((res) => res.json())
      .then((data) => {
        if (data && !data.message) {
          setFormData({
            teamName: data.teamName || "",
            managerName: data.managerName || "",
            phone: data.phone || "",
            location: data.location || "",
            logo: data.logo || "",
          });
        }
      })
      .catch((err) => console.error("Error loading team:", err))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch("/api/teams", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to update team profile");
      }

      setMessage({ text: "Team profile updated successfully!", type: "success" });
    } catch (err: any) {
      setMessage({ text: err.message, type: "error" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div style={{ color: "var(--text-tertiary)", padding: "2rem" }}>Loading team profile...</div>;
  }

  return (
    <div>
      <div className={styles.sectionHeader} style={{ marginBottom: "1.5rem" }}>
        <div>
          <h1 className={styles.sectionHeading} style={{ fontSize: "1.5rem" }}>
            Team Profile Settings
          </h1>
          <p style={{ color: "var(--text-tertiary)", fontSize: "0.85rem", margin: "0.25rem 0 0" }}>
            Update your organization's public name, captain/manager information, and location.
          </p>
        </div>
      </div>

      <div className={styles.cardSection}>
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

        <form onSubmit={handleSubmit}>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Team Name *</label>
              <input
                type="text"
                required
                className={styles.formInput}
                value={formData.teamName}
                onChange={(e) =>
                  setFormData({ ...formData, teamName: e.target.value })
                }
                placeholder="e.g. Dapitan Pickleball Club"
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Manager / Captain Name *</label>
              <input
                type="text"
                required
                className={styles.formInput}
                value={formData.managerName}
                onChange={(e) =>
                  setFormData({ ...formData, managerName: e.target.value })
                }
                placeholder="e.g. Juan Dela Cruz"
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Contact Phone</label>
              <input
                type="tel"
                className={styles.formInput}
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                placeholder="e.g. +63 917 123 4567"
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>City / Location</label>
              <input
                type="text"
                className={styles.formInput}
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
                placeholder="e.g. Dapitan City, Zamboanga del Norte"
              />
            </div>

            <div className={styles.formGroup} style={{ gridColumn: "1 / -1" }}>
              <label className={styles.formLabel}>Team Logo URL (Optional)</label>
              <input
                type="url"
                className={styles.formInput}
                value={formData.logo}
                onChange={(e) =>
                  setFormData({ ...formData, logo: e.target.value })
                }
                placeholder="https://example.com/logo.png"
              />
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button type="submit" disabled={saving} className={styles.saveBtn}>
              {saving ? "Saving Changes..." : "Save Team Profile"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
