"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import styles from "./Sidebar.module.css";
import { ThemeToggle } from "@/frontend/components/ThemeToggle";

const teamNavItems = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/team", label: "Team Profile" },
  { href: "/dashboard/players", label: "Player Roster" },
  { href: "/dashboard/tournaments", label: "Tournaments" },
  { href: "/dashboard/matches", label: "Match Schedule" },
];

export function TeamSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <aside className={styles.sidebar}>
      <Link href="/dashboard" className={styles.brand}>
        <div className={styles.brandText}>
          <span className={styles.brandTitle}>DuwaTa</span>
          <span className={styles.roleTag}>Team Portal</span>
        </div>
      </Link>

      <nav className={styles.nav}>
        <div className={styles.navSectionTitle}>Team Management</div>
        {teamNavItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.navItem} ${isActive ? styles.activeItem : ""}`}
            >
              <span>{item.label}</span>
            </Link>
          );
        })}

        <div className={styles.navSectionTitle}>Public Discovery</div>
        <Link href="/tournaments" className={styles.navItem}>
          <span>Public Tournaments</span>
        </Link>
      </nav>

      <div className={styles.footer}>
        <div className={styles.footerTop}>
          <span className={styles.themeLabel}>Appearance</span>
          <ThemeToggle />
        </div>
        <div className={styles.userInfo}>
          <div className={styles.userAvatar}>
            {session?.user.teamName
              ? session.user.teamName[0].toUpperCase()
              : session?.user.email
              ? session.user.email[0].toUpperCase()
              : "T"}
          </div>
          <div className={styles.userDetails}>
            <span className={styles.userName}>
              {session?.user.teamName || "My Team"}
            </span>
            <span className={styles.userEmail}>{session?.user.email}</span>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className={styles.signOutButton}
        >
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
