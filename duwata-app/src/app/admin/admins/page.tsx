"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import styles from "@/frontend/styles/admin.module.css";
import { formatDate } from "@/frontend/lib/utils";

interface Admin {
  id: string;
  name: string | null;
  email: string;
  role: string;
  createdAt: string;
}

export default function AdminAdminsPage() {
  const { data: session } = useSession();
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchAdmins = async () => {
    try {
      const res = await fetch("/api/admin/admins");
      if (res.ok) {
        setAdmins(await res.json());
      }
    } catch (err) {
      console.error("Error fetching admins:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/admin/admins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Could not create admin account");
        return;
      }

      setAdmins((prev) => [...prev, data.admin]);
      setSuccess(`Admin account created for ${data.admin.email}`);
      setName("");
      setEmail("");
      setPassword("");
    } catch (err) {
      console.error("Error creating admin:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className={styles.sectionHeader} style={{ marginBottom: "1.5rem" }}>
        <div>
          <h1 className={styles.sectionTitle} style={{ fontSize: "1.5rem" }}>
            Admin Management
          </h1>
          <p style={{ color: "var(--text-tertiary)", fontSize: "0.85rem", margin: "0.25rem 0 0" }}>
            Grant console access to other organizers. Only admins can add admins.
          </p>
        </div>
      </div>

      <div className={styles.cardSection}>
        <h2 className={styles.sectionTitle}>Add a New Admin</h2>

        <form onSubmit={handleSubmit} className={styles.formGrid}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Name (optional)</label>
            <input
              className={styles.formInput}
              type="text"
              placeholder="e.g. Maria Santos"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Email</label>
            <input
              className={styles.formInput}
              type="email"
              placeholder="organizer@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Password</label>
            <input
              className={styles.formInput}
              type="password"
              placeholder="Minimum 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          <div className={styles.formGroup} style={{ display: "flex", alignItems: "flex-end" }}>
            <button type="submit" className={styles.primaryBtn} disabled={saving}>
              {saving ? "Creating..." : "Create Admin"}
            </button>
          </div>
        </form>

        {error && (
          <div
            style={{
              marginTop: "1rem",
              padding: "0.75rem 1rem",
              border: "1px solid rgba(var(--rgb-veil), 0.15)",
              background: "rgba(var(--rgb-veil), 0.05)",
              color: "var(--text-secondary)",
              fontSize: "0.85rem",
            }}
          >
            {error}
          </div>
        )}
        {success && (
          <div
            style={{
              marginTop: "1rem",
              padding: "0.75rem 1rem",
              border: "1px solid rgba(var(--rgb-line), 0.4)",
              background: "rgba(var(--rgb-tint-2), 0.12)",
              color: "var(--text-secondary)",
              fontSize: "0.85rem",
            }}
          >
            {success}
          </div>
        )}
      </div>

      <div className={styles.cardSection}>
        <h2 className={styles.sectionTitle}>All Admins ({admins.length})</h2>

        {loading ? (
          <div style={{ color: "var(--text-tertiary)", padding: "2rem", textAlign: "center" }}>
            Loading admins...
          </div>
        ) : admins.length === 0 ? (
          <div style={{ textAlign: "center", padding: "3rem", color: "var(--text-tertiary)" }}>
            <h3>No admin accounts yet</h3>
          </div>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.adminTable}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Added</th>
                </tr>
              </thead>
              <tbody>
                {admins.map((a) => (
                  <tr key={a.id}>
                    <td>
                      <strong>{a.name || "Administrator"}</strong>
                      {session?.user.email === a.email && (
                        <div style={{ fontSize: "0.75rem", color: "var(--text-tertiary)" }}>You</div>
                      )}
                    </td>
                    <td>{a.email}</td>
                    <td>
                      <span
                        style={{
                          fontSize: "0.72rem",
                          fontWeight: 700,
                          padding: "0.2rem 0.5rem",
                          borderRadius: "4px",
                          background: "rgba(var(--rgb-tint-2), 0.15)",
                          color: "var(--text-tertiary)",
                        }}
                      >
                        {a.role}
                      </span>
                    </td>
                    <td>{formatDate(a.createdAt)}</td>
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
