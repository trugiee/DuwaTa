// Bracket generation utility for single elimination tournaments

export interface BracketMatch {
  matchNumber: number;
  round: number;
  teamAId: string | null;
  teamBId: string | null;
  nextMatchNumber: number | null;
  nextMatchSlot: "A" | "B" | null;
  isBye: boolean;
}

/**
 * Get the next power of 2 that is >= n
 */
function nextPowerOf2(n: number): number {
  let power = 1;
  while (power < n) {
    power *= 2;
  }
  return power;
}

/**
 * Generate a single-elimination bracket from a list of team IDs.
 *
 * - If team count is not a power of 2, BYEs are inserted.
 * - Teams are seeded in order (first team = seed 1).
 * - BYE matches auto-advance the non-BYE team.
 *
 * Returns an array of BracketMatch objects representing the entire bracket.
 */
export function generateSingleEliminationBracket(
  teamIds: string[]
): BracketMatch[] {
  const n = teamIds.length;
  if (n < 2) {
    throw new Error("Need at least 2 teams to generate a bracket");
  }

  const bracketSize = nextPowerOf2(n);
  const totalRounds = Math.log2(bracketSize);
  const byeCount = bracketSize - n;

  // Create seeded slots: fill with team IDs and nulls for BYEs
  // Standard seeding: 1v(N), 2v(N-1), etc.
  const seeds: (string | null)[] = new Array(bracketSize).fill(null);

  // Place teams using standard tournament seeding
  const seededPositions = generateSeeding(bracketSize);
  for (let i = 0; i < bracketSize; i++) {
    const seedIndex = seededPositions[i];
    if (seedIndex < n) {
      seeds[i] = teamIds[seedIndex];
    }
    // null = BYE
  }

  const matches: BracketMatch[] = [];
  let matchNumber = 1;

  // Track match numbers per round for linking
  const roundMatches: number[][] = [];

  // Generate first round matches
  const firstRoundMatches: number[] = [];
  for (let i = 0; i < bracketSize; i += 2) {
    const teamA = seeds[i];
    const teamB = seeds[i + 1];
    const isBye = teamA === null || teamB === null;

    firstRoundMatches.push(matchNumber);
    matches.push({
      matchNumber,
      round: 1,
      teamAId: teamA,
      teamBId: teamB,
      nextMatchNumber: null, // Will be set after
      nextMatchSlot: null,
      isBye,
    });
    matchNumber++;
  }
  roundMatches.push(firstRoundMatches);

  // Generate subsequent rounds
  for (let round = 2; round <= totalRounds; round++) {
    const prevRound = roundMatches[round - 2];
    const currentRoundMatches: number[] = [];

    for (let i = 0; i < prevRound.length; i += 2) {
      currentRoundMatches.push(matchNumber);

      matches.push({
        matchNumber,
        round,
        teamAId: null,
        teamBId: null,
        nextMatchNumber: null,
        nextMatchSlot: null,
        isBye: false,
      });

      // Link previous round matches to this match
      const matchA = matches.find((m) => m.matchNumber === prevRound[i])!;
      const matchB = matches.find((m) => m.matchNumber === prevRound[i + 1])!;

      matchA.nextMatchNumber = matchNumber;
      matchA.nextMatchSlot = "A";

      matchB.nextMatchNumber = matchNumber;
      matchB.nextMatchSlot = "B";

      matchNumber++;
    }
    roundMatches.push(currentRoundMatches);
  }

  return matches;
}

/**
 * Generate standard tournament seeding positions.
 * Ensures top seeds don't meet until later rounds.
 */
function generateSeeding(size: number): number[] {
  if (size === 1) return [0];
  if (size === 2) return [0, 1];

  const half = size / 2;
  const topHalf = generateSeeding(half);
  const result: number[] = [];

  for (const seed of topHalf) {
    result.push(seed);
    result.push(size - 1 - seed);
  }

  return result;
}

/**
 * Get the round name for display
 */
export function getRoundName(round: number, totalRounds: number): string {
  const roundsFromEnd = totalRounds - round;

  switch (roundsFromEnd) {
    case 0:
      return "Final";
    case 1:
      return "Semifinal";
    case 2:
      return "Quarterfinal";
    default:
      return `Round ${round}`;
  }
}
