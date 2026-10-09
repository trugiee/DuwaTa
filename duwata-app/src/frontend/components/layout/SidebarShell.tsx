"use client";

import React, { useState } from "react";
import styles from "@/frontend/styles/dashboard.module.css";

export function SidebarShell({
  sidebar,
  brand,
  children,
}: {
  sidebar: React.ReactNode;
  brand: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className={styles.dashboardWrapper}>
      <div
        className={`${styles.drawerBackdrop} ${open ? styles.drawerOpen : ""}`}
        onClick={() => setOpen(false)}
      />
      <div
        className={`${styles.drawer} ${open ? styles.drawerOpen : ""}`}
        onClick={() => setOpen(false)}
      >
        {sidebar}
      </div>

      <div className={styles.mainContent}>
        <div className={styles.mobileBar}>
          <button
            type="button"
            className={styles.menuBtn}
            aria-label="Open menu"
            onClick={() => setOpen((v) => !v)}
          >
            <span />
            <span />
            <span />
          </button>
          <span className={styles.mobileBrand}>{brand}</span>
        </div>
        <div className={styles.contentBody}>{children}</div>
      </div>
    </div>
  );
}
