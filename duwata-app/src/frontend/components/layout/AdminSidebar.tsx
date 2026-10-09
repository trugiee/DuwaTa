"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import styles from "./Sidebar.module.css";
import { ThemeToggle } from "@/frontend/components/ThemeToggle";

const adminNavItems = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/tournaments", label: "Tournaments" },
  { href: "/admin/registrations", label: "Registrations" },
  { href: "/admin/matches", label: "Match Scoring" },
  { href: "/admin/users", label: "All Accounts" },
  { href: "/admin/admins", label: "Admin Management" },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <aside className={styles.sidebar}>
      <Link href="/admin" className={styles.brand}>
        <div className={styles.brandText}>
          <span className={styles.brandTitle}>DuwaTa</span>
          <span className={styles.roleTag}>Admin Portal</span>
        </div>
      </Link>

      <nav className={styles.nav}>
        <div className={styles.navSectionTitle}>Organizer Tools</div>
        {adminNavItems.map((item) => {
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

        <div className={styles.navSectionTitle}>View as Spectator</div>
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
          <div className={styles.userAvatar}>A</div>
          <div className={styles.userDetails}>
            <span className={styles.userName}>Administrator</span>
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
