"use client";

import React, { useState } from "react";
import styles from "@/frontend/styles/admin.module.css";
import { formatDate } from "@/frontend/lib/utils";

interface Registration {
  id: string;
  tournament: { name: string };
  category: { name: string };
  team: { teamName: string; managerName: string };
  createdAt: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
}

export function AdminQuickApprovals({
  initialRegistrations,
}: {
  initialRegistrations: Registration[];
}) {
  const [registrations, setRegistrations] = useState<Registration[]>(
    initialRegistrations
  );
  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleUpdateStatus = async (
    regId: string,
    newStatus: "APPROVED" | "REJECTED"
  ) => {
    setProcessingId(regId);
    try {
      const res = await fetch(`/api/registrations/${regId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        setRegistrations(registrations.filter((r) => r.id !== regId));
      } else {
        alert("Failed to update registration status");
      }
    } catch (err) {
      console.error("Error updating registration:", err);
    } finally {
      setProcessingId(null);
    }
  };

  if (registrations.length === 0) {
    return (
      <p style={{ color: "var(--text-tertiary)", padding: "1rem 0" }}>
         All caught up! No pending registrations awaiting approval.
      </p>
    );
  }

  return (
    <div className={styles.tableWrap}>
      <table className={styles.adminTable}>
        <thead>
          <tr>
            <th>Team Name</th>
            <th>Manager</th>
            <th>Tournament</th>
            <th>Category</th>
            <th>Registered At</th>
            <th>Review Actions</th>
          </tr>
        </thead>
        <tbody>
          {registrations.map((r) => (
            <tr key={r.id}>
              <td>
                <strong>{r.team.teamName}</strong>
              </td>
              <td>{r.team.managerName}</td>
              <td>{r.tournament.name}</td>
              <td>{r.category.name}</td>
              <td>{formatDate(r.createdAt)}</td>
              <td>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <button
                    disabled={processingId === r.id}
                    onClick={() => handleUpdateStatus(r.id, "APPROVED")}
                    className={styles.approveBtn}
                  >
                    ✓ Approve
                  </button>
                  <button
                    disabled={processingId === r.id}
                    onClick={() => handleUpdateStatus(r.id, "REJECTED")}
                    className={styles.rejectBtn}
                  >
                    ✕ Reject
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
