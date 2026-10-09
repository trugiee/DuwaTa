import { TournamentStatus, RegistrationStatus, MatchStatus } from "@prisma/client";

/**
 * Format a date for display
 */
export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Format a date and time for display
 */
export function formatDateTime(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

/**
 * Format time only
 */
export function formatTime(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

/**
 * Get tournament status badge class
 */
export function getTournamentStatusClass(status: TournamentStatus): string {
  switch (status) {
    case "DRAFT":
      return "badge-default";
    case "OPEN":
      return "badge-success";
    case "CLOSED":
      return "badge-warning";
    case "ONGOING":
      return "badge-info";
    case "COMPLETED":
      return "badge-default";
    default:
      return "badge-default";
  }
}

/**
 * Get registration status badge class
 */
export function getRegistrationStatusClass(
  status: RegistrationStatus
): string {
  switch (status) {
    case "PENDING":
      return "badge-warning";
    case "APPROVED":
      return "badge-success";
    case "REJECTED":
      return "badge-error";
    default:
      return "badge-default";
  }
}

/**
 * Get match status badge class
 */
export function getMatchStatusClass(status: MatchStatus): string {
  switch (status) {
    case "SCHEDULED":
      return "badge-info";
    case "ONGOING":
      return "badge-warning";
    case "COMPLETED":
      return "badge-success";
    default:
      return "badge-default";
  }
}

/**
 * Get initials from a name
 */
export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Check if registration is still open for a tournament
 */
export function isRegistrationOpen(
  status: TournamentStatus,
  deadline: Date | string
): boolean {
  return status === "OPEN" && new Date(deadline) > new Date();
}

/**
 * Pluralize a word
 */
export function pluralize(count: number, singular: string, plural?: string): string {
  return count === 1 ? singular : plural || `${singular}s`;
}

/**
 * Truncate text
 */
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length) + "...";
}

/**
 * API fetch wrapper with error handling
 */
export async function apiFetch<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    ...options,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: "An error occurred" }));
    throw new Error(error.message || `HTTP ${res.status}`);
  }

  return res.json();
}
