"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "@/frontend/styles/auth.module.css";
import { ThemeToggle } from "@/frontend/components/ThemeToggle";

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password");
      } else {
        // Fetch session to determine role
        const res = await fetch("/api/auth/session");
        const session = await res.json();

        if (session?.user?.role === "ADMIN") {
          router.push("/admin");
        } else {
          router.push("/dashboard");
        }
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.authPage}>
      <div className={styles.authLeft}>
        <Link href="/" className={styles.authLogo}>
          <span className={styles.logoText}>DuwaTa</span>
        </Link>
        <div className={styles.authLeftContent}>
          <h1>Welcome back</h1>
          <p>Manage your team and track your tournaments.</p>
        </div>
      </div>

      <div className={styles.authRight}>
        <ThemeToggle className={styles.authThemeBtn} />
        <div className={styles.authForm}>
          <div className={styles.authFormHeader}>
            <h2>Sign In</h2>
            <p>Enter your credentials to access your account</p>
          </div>

          {error && (
            <div className="alert alert-error">{error}</div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                className="form-input"
                placeholder="team@example.com"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
              />
            </div>

            <div className="form-group" style={{ marginTop: "var(--space-4)" }}>
              <label className="form-label" htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ width: "100%", marginTop: "var(--space-6)" }}
            >
              {loading ? (
                <span className="spinner" />
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <div className={styles.authFormFooter}>
            <p>
              Don&apos;t have a team account?{" "}
              <Link href="/auth/register" className={styles.authLink}>
                Register here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
