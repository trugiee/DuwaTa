"use client";

import React, { useState, useEffect } from "react";
import styles from "@/frontend/styles/admin.module.css";
import { formatDate } from "@/frontend/lib/utils";
import Link from "next/link";

interface Registration {
  id: string;
  tournamentId: string;
  categoryId: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
  tournament: {
    id: string;
    name: string;
  };
  category: {
    name: string;
  };
  team: {
    id: string;
    teamName: string;
    managerName: string;
    phone?: string | null;
    location?: string | null;
  };
}

export default function AdminRegistrationsPage() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchRegistrations = async () => {
    try {
      const res = await fetch("/api/registrations");
      if (res.ok) {
        const data = await res.json();
        setRegistrations(data);
      }
    } catch (err) {
      console.error("Error fetching registrations:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const handleUpdateStatus = async (
    id: string,
    newStatus: "APPROVED" | "REJECTED"
  ) => {
    setProcessingId(id);
    try {
      const res = await fetch(`/api/registrations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        setRegistrations(
          registrations.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
        );
      } else {
        alert("Failed to update registration status");
      }
    } catch (err) {
      console.error("Error updating registration:", err);
    } finally {
      setProcessingId(null);
    }
  };

  const filteredRegistrations = registrations.filter((r) => {
    if (statusFilter === "ALL") return true;
    return r.status === statusFilter;
  });

  return (
    <div>
      <div className={styles.sectionHeader} style={{ marginBottom: "1.5rem" }}>
        <div>
          <h1 className={styles.sectionHeading} style={{ fontSize: "1.5rem" }}>
            All Team Registrations
          </h1>
          <p style={{ color: "var(--text-tertiary)", fontSize: "0.85rem", margin: "0.25rem 0 0" }}>
            Review, approve, or reject team entries across all tournaments.
          </p>
        </div>
      </div>

      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem" }}>
        {["ALL", "PENDING", "APPROVED", "REJECTED"].map((st) => (
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
            {st === "ALL" ? "All Entries" : st}
          </button>
        ))}
      </div>

      <div className={styles.cardSection}>
        {loading ? (
          <div style={{ color: "var(--text-tertiary)", padding: "2rem", textAlign: "center" }}>
            Loading registrations...
          </div>
        ) : filteredRegistrations.length === 0 ? (
          <div style={{ textAlign: "center", padding: "3rem", color: "var(--text-tertiary)" }}>
            <h3>No registrations found</h3>
            <p style={{ fontSize: "0.85rem" }}>
              No team entries match the selected status filter.
            </p>
          </div>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.adminTable}>
              <thead>
                <tr>
                  <th>Team</th>
                  <th>Manager Contact</th>
                  <th>Tournament</th>
                  <th>Category</th>
                  <th>Registered</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRegistrations.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <strong>{r.team.teamName}</strong>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-tertiary)" }}>
                         {r.team.location || "Location not set"}
                      </div>
                    </td>
                    <td>
                      <div>{r.team.managerName}</div>
                      {r.team.phone && (
                        <div style={{ fontSize: "0.75rem", color: "var(--text-tertiary)" }}>
                           {r.team.phone}
                        </div>
                      )}
                    </td>
                    <td>
                      <Link
                        href={`/admin/tournaments/${r.tournament.id}`}
                        style={{ color: "var(--text-tertiary)", fontWeight: 600 }}
                      >
                        {r.tournament.name}
                      </Link>
                    </td>
                    <td>{r.category.name}</td>
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
                            disabled={processingId === r.id}
                            onClick={() => handleUpdateStatus(r.id, "APPROVED")}
                            className={styles.approveBtn}
                          >
                            Approve
                          </button>
                        )}
                        {r.status !== "REJECTED" && (
                          <button
                            disabled={processingId === r.id}
                            onClick={() => handleUpdateStatus(r.id, "REJECTED")}
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
    </div>
  );
}
