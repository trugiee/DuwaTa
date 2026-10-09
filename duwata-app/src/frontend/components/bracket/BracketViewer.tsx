"use client";

import React from "react";
import styles from "./BracketViewer.module.css";

export interface BracketMatch {
  id: string;
  round: number;
  matchNumber: number;
  teamA?: {
    id: string;
    teamName: string;
    logo?: string | null;
  } | null;
  teamB?: {
    id: string;
    teamName: string;
    logo?: string | null;
  } | null;
  scoreA?: number | null;
  scoreB?: number | null;
  court?: string | null;
  scheduledAt?: string | Date | null;
  status: "SCHEDULED" | "ONGOING" | "COMPLETED";
  winnerTeamId?: string | null;
}

interface BracketViewerProps {
  matches: BracketMatch[];
  onMatchSelect?: (match: BracketMatch) => void;
  isAdmin?: boolean;
}

export function BracketViewer({ matches, onMatchSelect, isAdmin }: BracketViewerProps) {
  if (!matches || matches.length === 0) {
    return (
      <div className={styles.emptyBracket}>
        <h3>No Bracket Generated Yet</h3>
        <p>The tournament organizer hasn't published the bracket for this category yet.</p>
      </div>
    );
  }

  // Group matches by round
  const roundsMap = matches.reduce((acc, match) => {
    if (!acc[match.round]) {
      acc[match.round] = [];
    }
    acc[match.round].push(match);
    return acc;
  }, {} as Record<number, BracketMatch[]>);

  const rounds = Object.keys(roundsMap)
    .map(Number)
    .sort((a, b) => a - b);

  const totalRounds = rounds.length;

  const getRoundLabel = (round: number) => {
    if (round === totalRounds) return "Championship Final";
    if (round === totalRounds - 1) return "Semifinals";
    if (round === totalRounds - 2) return "Quarterfinals";
    return `Round ${round}`;
  };

  return (
    <div className={styles.bracketContainer}>
      <div className={styles.roundsTrack}>
        {rounds.map((round) => {
          const roundMatches = roundsMap[round].sort(
            (a, b) => a.matchNumber - b.matchNumber
          );
          return (
            <div key={round} className={styles.roundColumn}>
              <div className={styles.roundHeader}>
                <span className={styles.roundBadge}>R{round}</span>
                <h4 className={styles.roundTitle}>{getRoundLabel(round)}</h4>
                <span className={styles.roundCount}>
                  {roundMatches.length} {roundMatches.length === 1 ? "Match" : "Matches"}
                </span>
              </div>

              <div className={styles.matchesList}>
                {roundMatches.map((m) => {
                  const isAWin = m.status === "COMPLETED" && m.winnerTeamId === m.teamA?.id;
                  const isBWin = m.status === "COMPLETED" && m.winnerTeamId === m.teamB?.id;

                  return (
                    <div
                      key={m.id}
                      className={`${styles.matchCard} ${
                        isAdmin ? styles.clickableCard : ""
                      } ${m.status === "ONGOING" ? styles.liveCard : ""}`}
                      onClick={() => onMatchSelect && onMatchSelect(m)}
                    >
                      <div className={styles.matchMeta}>
                        <span className={styles.matchNum}>#{m.matchNumber}</span>
                        {m.court && <span className={styles.matchCourt}> {m.court}</span>}
                        {m.status === "ONGOING" && (
                          <span className={styles.liveBadge}>LIVE</span>
                        )}
                        {m.status === "COMPLETED" && (
                          <span className={styles.completedBadge}>Final</span>
                        )}
                      </div>

                      <div className={styles.matchTeams}>
                        {/* Team A */}
                        <div
                          className={`${styles.teamRow} ${
                            isAWin ? styles.winnerRow : ""
                          }`}
                        >
                          <div className={styles.teamInfo}>
                            <div className={styles.teamAvatar}>
                              {m.teamA?.teamName ? m.teamA.teamName[0].toUpperCase() : "?"}
                            </div>
                            <span className={styles.teamName}>
                              {m.teamA?.teamName || "TBD / BYE"}
                            </span>
                          </div>
                          <span className={styles.score}>
                            {m.scoreA !== null && m.scoreA !== undefined ? m.scoreA : "—"}
                          </span>
                        </div>

                        <div className={styles.teamDivider} />

                        {/* Team B */}
                        <div
                          className={`${styles.teamRow} ${
                            isBWin ? styles.winnerRow : ""
                          }`}
                        >
                          <div className={styles.teamInfo}>
                            <div className={styles.teamAvatar}>
                              {m.teamB?.teamName ? m.teamB.teamName[0].toUpperCase() : "?"}
                            </div>
                            <span className={styles.teamName}>
                              {m.teamB?.teamName || "TBD / BYE"}
                            </span>
                          </div>
                          <span className={styles.score}>
                            {m.scoreB !== null && m.scoreB !== undefined ? m.scoreB : "—"}
                          </span>
                        </div>
                      </div>

                      {isAdmin && (
                        <div className={styles.adminActionHint}>
                          <span>Click to update score / schedule</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
