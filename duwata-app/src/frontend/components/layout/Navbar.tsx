"use client";

import Link from "next/link";
import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import styles from "./Navbar.module.css";
import { ThemeToggle } from "@/frontend/components/ThemeToggle";

export function Navbar() {
  const { data: session, status } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className={styles.navbar}>
      <div className={styles.container}>
        <Link href="/" className={styles.brand}>
          <div className={styles.brandText}>
            <span className={styles.brandTitle}>DuwaTa</span>
            <span className={styles.brandSub}>Pickleball</span>
          </div>
        </Link>

        <button
          type="button"
          className={styles.menuToggle}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
        >
          <span />
          <span />
          <span />
        </button>

        <nav
          className={`${styles.navLinks} ${menuOpen ? styles.navLinksOpen : ""}`}
          onClick={() => setMenuOpen(false)}
        >
          <Link href="/tournaments" className={styles.navLink}>
            Tournaments
          </Link>
          <Link href="/#how-it-works" className={styles.navLink}>
            How It Works
          </Link>
          <Link href="/#bracket-preview" className={styles.navLink}>
            Live Brackets
          </Link>
        </nav>

        <div className={styles.authArea}>
          <ThemeToggle />
          {status === "loading" ? (
            <div className={styles.skeleton}></div>
          ) : session ? (
            <div className={styles.userMenu}>
              {session.user.role === "ADMIN" ? (
                <Link href="/admin" className={styles.dashboardBtn}>
                  Admin Console
                </Link>
              ) : (
                <Link href="/dashboard" className={styles.dashboardBtn}>
                  Team Dashboard
                </Link>
              )}
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className={styles.signOutBtn}
                title="Sign Out"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className={styles.anonActions}>
              <Link href="/auth/login" className={styles.loginBtn}>
                Sign In
              </Link>
              <Link href="/auth/register" className={styles.registerBtn}>
                Register Team
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
