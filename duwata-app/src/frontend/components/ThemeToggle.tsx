"use client";

import styles from "./ThemeToggle.module.css";

const SUN = (
  <svg
    className={`${styles.icon} ${styles.toLight}`}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
  </svg>
);

const MOON = (
  <svg
    className={`${styles.icon} ${styles.toDark}`}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
  </svg>
);

export function ThemeToggle({ className = "" }: { className?: string }) {
  return (
    <button
      type="button"
      className={`${styles.toggle} ${className}`}
      aria-label="Toggle light and dark theme"
      title="Toggle light / dark theme"
      onClick={() => {
        const root = document.documentElement;
        const next = root.getAttribute("data-theme") === "light" ? "dark" : "light";
        root.setAttribute("data-theme", next);
        try {
          localStorage.setItem("duwata-theme", next);
        } catch {
          /* storage unavailable */
        }
      }}
    >
      {SUN}
      {MOON}
    </button>
  );
}
