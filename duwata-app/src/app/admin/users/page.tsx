"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import styles from "@/frontend/styles/admin.module.css";
import { formatDate } from "@/frontend/lib/utils";

interface Account {
  id: string;
  name: string | null;
  email: string;
  role: string;
  createdAt: string;
  team: {
    teamName: string;
    managerName: string;
    phone: string | null;
    location: string | null;
    _count: { players: number };
  } | null;
}

export default function AdminUsersPage() {
  const { data: session } = useSession();
  const [users, setUsers] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch("/api/admin/users");
        if (res.ok) setUsers(await res.json());
      } catch (err) {
        console.error("Error fetching users:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) =>
      [
        u.name,
        u.email,
        u.role,
        u.team?.teamName,
        u.team?.managerName,
        u.team?.location,
      ]
        .filter(Boolean)
        .some((v) => (v as string).toLowerCase().includes(q))
    );
  }, [users, query]);

  return (
    <div>
      <div className={styles.sectionHeader} style={{ marginBottom: "1.5rem" }}>
        <div>
          <h1 className={styles.sectionTitle} style={{ fontSize: "1.5rem" }}>
            All Accounts
          </h1>
          <p style={{ color: "var(--text-tertiary)", fontSize: "0.85rem", margin: "0.25rem 0 0" }}>
            Every user account and the team it belongs to, in one place.
          </p>
        </div>
      </div>

      <div className={styles.cardSection}>
        <div style={{ marginBottom: "1.25rem" }}>
          <input
            className={styles.formInput}
            type="search"
            placeholder="Search by name, email, team, or manager..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        {loading ? (
          <div style={{ color: "var(--text-tertiary)", padding: "2rem", textAlign: "center" }}>
            Loading accounts...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "3rem", color: "var(--text-tertiary)" }}>
            <h3>No accounts found</h3>
          </div>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.adminTable}>
              <thead>
                <tr>
                  <th>Account</th>
                  <th>Role</th>
                  <th>Team</th>
                  <th>Manager</th>
                  <th>Location</th>
                  <th>Players</th>
                  <th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <strong>{u.name || u.team?.teamName || "—"}</strong>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-tertiary)" }}>{u.email}</div>
                    </td>
                    <td>
                      <span
                        style={{
                          fontSize: "0.72rem",
                          fontWeight: 700,
                          padding: "0.2rem 0.5rem",
                          borderRadius: "4px",
                          background:
                            u.role === "ADMIN"
                              ? "rgba(var(--rgb-tint), 0.15)"
                              : "rgba(var(--rgb-tint-2), 0.12)",
                          color: u.role === "ADMIN" ? "var(--text-secondary)" : "var(--text-tertiary)",
                        }}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td>{u.team ? u.team.teamName : "—"}</td>
                    <td>
                      {u.team ? (
                        <>
                          <div>{u.team.managerName}</div>
                          {u.team.phone && (
                            <div style={{ fontSize: "0.75rem", color: "var(--text-tertiary)" }}>
                              {u.team.phone}
                            </div>
                          )}
                        </>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td>{u.team?.location || "—"}</td>
                    <td>{u.team ? u.team._count.players : "—"}</td>
                    <td>{formatDate(u.createdAt)}</td>
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
