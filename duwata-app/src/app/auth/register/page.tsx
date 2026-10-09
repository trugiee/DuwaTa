"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "@/frontend/styles/auth.module.css";
import { ThemeToggle } from "@/frontend/components/ThemeToggle";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    teamName: "",
    managerName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message);
        return;
      }

      // Auto-login after registration
      const result = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.ok) {
        router.push("/dashboard");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className={styles.authPage}>
      <div className={styles.authLeft}>
        <Link href="/" className={styles.authLogo}>
          <span className={styles.logoText}>DuwaTa</span>
        </Link>
        <div className={styles.authLeftContent}>
          <h1>Create Your Team</h1>
          <p>
            Register your team account to join tournaments and compete.
          </p>
        </div>
      </div>

      <div className={styles.authRight}>
        <ThemeToggle className={styles.authThemeBtn} />
        <div className={styles.authForm}>
          <div className={styles.authFormHeader}>
            <h2>Team Registration</h2>
            <p>Create one account for your entire team</p>
          </div>

          {error && (
            <div className="alert alert-error">{error}</div>
          )}

          <form onSubmit={handleSubmit}>
            <div className={styles.formGrid}>
              <div className="form-group">
                <label className="form-label" htmlFor="teamName">Team Name</label>
                <input
                  id="teamName"
                  type="text"
                  className="form-input"
                  placeholder="DuwaTa Team"
                  value={formData.teamName}
                  onChange={(e) => updateField("teamName", e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="managerName">Manager Name</label>
                <input
                  id="managerName"
                  type="text"
                  className="form-input"
                  placeholder="Juan Dela Cruz"
                  value={formData.managerName}
                  onChange={(e) => updateField("managerName", e.target.value)}
                  required
                />
              </div>
            </div>

            <div className={styles.formGrid} style={{ marginTop: "var(--space-4)" }}>
              <div className="form-group">
                <label className="form-label" htmlFor="regEmail">Email</label>
                <input
                  id="regEmail"
                  type="email"
                  className="form-input"
                  placeholder="team@example.com"
                  value={formData.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="phone">Phone Number</label>
                <input
                  id="phone"
                  type="tel"
                  className="form-input"
                  placeholder="+639171234567"
                  value={formData.phone}
                  onChange={(e) => updateField("phone", e.target.value)}
                />
              </div>
            </div>

            <div className={styles.formGrid} style={{ marginTop: "var(--space-4)" }}>
              <div className="form-group">
                <label className="form-label" htmlFor="regPassword">Password</label>
                <input
                  id="regPassword"
                  type="password"
                  className="form-input"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => updateField("password", e.target.value)}
                  required
                  minLength={6}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="confirmPassword">Confirm Password</label>
                <input
                  id="confirmPassword"
                  type="password"
                  className="form-input"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={(e) => updateField("confirmPassword", e.target.value)}
                  required
                />
              </div>
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
                "Create Team Account"
              )}
            </button>
          </form>

          <div className={styles.authFormFooter}>
            <p>
              Already have an account?{" "}
              <Link href="/auth/login" className={styles.authLink}>
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
