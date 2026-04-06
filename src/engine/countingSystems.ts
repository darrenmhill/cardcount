import { Card, CountingSystem, CountingSystemId } from '../types';

// All major card counting systems used by professional players
export const COUNTING_SYSTEMS: Record<CountingSystemId, CountingSystem> = {
  'hi-lo': {
    id: 'hi-lo',
    name: 'Hi-Lo',
    description: 'The most popular and widely-used system. Single-level balanced count developed by Harvey Dubner and popularized by Stanford Wong.',
    level: 1,
    balanced: true,
    sideCountAces: false,
    insuranceIndex: 3,
    values: {
      'A': -1, '2': 1, '3': 1, '4': 1, '5': 1, '6': 1,
      '7': 0, '8': 0, '9': 0, '10': -1, 'J': -1, 'Q': -1, 'K': -1,
    },
  },
  'hi-opt-i': {
    id: 'hi-opt-i',
    name: 'Hi-Opt I',
    description: 'Highly Optimum system level 1. Developed by Lance Humble. Ignores Aces and 2s for better playing efficiency. Requires ace side count.',
    level: 1,
    balanced: true,
    sideCountAces: true,
    insuranceIndex: 1.4,
    values: {
      'A': 0, '2': 0, '3': 1, '4': 1, '5': 1, '6': 1,
      '7': 0, '8': 0, '9': 0, '10': -1, 'J': -1, 'Q': -1, 'K': -1,
    },
  },
  'hi-opt-ii': {
    id: 'hi-opt-ii',
    name: 'Hi-Opt II',
    description: 'Highly Optimum system level 2. Multi-level count with higher playing efficiency. Developed by Lance Humble and Carl Cooper.',
    level: 2,
    balanced: true,
    sideCountAces: true,
    insuranceIndex: 1.4,
    values: {
      'A': 0, '2': 1, '3': 1, '4': 2, '5': 2, '6': 1,
      '7': 1, '8': 0, '9': 0, '10': -2, 'J': -2, 'Q': -2, 'K': -2,
    },
  },
  'omega-ii': {
    id: 'omega-ii',
    name: 'Omega II',
    description: 'Multi-level balanced system by Bryce Carlson. Excellent playing and betting correlation. Published in "Blackjack for Blood".',
    level: 2,
    balanced: true,
    sideCountAces: true,
    insuranceIndex: 1.4,
    values: {
      'A': 0, '2': 1, '3': 1, '4': 2, '5': 2, '6': 2,
      '7': 1, '8': 0, '9': -1, '10': -2, 'J': -2, 'Q': -2, 'K': -2,
    },
  },
  'zen': {
    id: 'zen',
    name: 'Zen Count',
    description: 'Multi-level balanced system by Arnold Snyder. Includes Ace in the count unlike Hi-Opt systems. Great all-around performance.',
    level: 2,
    balanced: true,
    sideCountAces: false,
    insuranceIndex: 2.3,
    values: {
      'A': -1, '2': 1, '3': 1, '4': 2, '5': 2, '6': 2,
      '7': 1, '8': 0, '9': 0, '10': -2, 'J': -2, 'Q': -2, 'K': -2,
    },
  },
  'wong-halves': {
    id: 'wong-halves',
    name: 'Wong Halves',
    description: 'Three-level balanced system by Stanford Wong. Uses fractional values for highest accuracy. Often doubled for easier mental math.',
    level: 3,
    balanced: true,
    sideCountAces: false,
    insuranceIndex: 2.7,
    values: {
      'A': -1, '2': 0.5, '3': 1, '4': 1, '5': 1.5, '6': 1,
      '7': 0.5, '8': 0, '9': -0.5, '10': -1, 'J': -1, 'Q': -1, 'K': -1,
    },
  },
  'ko': {
    id: 'ko',
    name: 'KO (Knockout)',
    description: 'Unbalanced single-level system by Fuchs & Vancura. No true count conversion needed — uses running count directly. Great for beginners.',
    level: 1,
    balanced: false,
    sideCountAces: false,
    insuranceIndex: 3, // RC-based for KO
    values: {
      'A': -1, '2': 1, '3': 1, '4': 1, '5': 1, '6': 1,
      '7': 1, '8': 0, '9': 0, '10': -1, 'J': -1, 'Q': -1, 'K': -1,
    },
  },
  'red-7': {
    id: 'red-7',
    name: 'Red 7',
    description: 'Unbalanced system by Arnold Snyder. Red 7s count +1, black 7s count 0. Simple yet powerful — published in "Blackbelt in Blackjack".',
    level: 1,
    balanced: false,
    sideCountAces: false,
    insuranceIndex: 3,
    values: {
      'A': -1, '2': 1, '3': 1, '4': 1, '5': 1, '6': 1,
      '7': 0.5, '8': 0, '9': 0, '10': -1, 'J': -1, 'Q': -1, 'K': -1,
      // Note: 7 = 0.5 represents average of red(+1) and black(0)
      // In the UI, user selects red or black 7 separately
    },
  },
  'ace-five': {
    id: 'ace-five',
    name: 'Ace-Five',
    description: 'The simplest counting system. Only tracks Aces (-1) and Fives (+1). Recommended by Stanford Wong for casual players.',
    level: 1,
    balanced: true,
    sideCountAces: false,
    insuranceIndex: Infinity, // not useful for insurance with this system
    values: {
      'A': -1, '2': 0, '3': 0, '4': 0, '5': 1, '6': 0,
      '7': 0, '8': 0, '9': 0, '10': 0, 'J': 0, 'Q': 0, 'K': 0,
    },
  },
};

export function getCardValue(card: Card, system: CountingSystem): number {
  return system.values[card];
}

export function calculateTrueCount(
  runningCount: number,
  decksRemaining: number,
  system: CountingSystem,
): number {
  if (!system.balanced) {
    return runningCount;
  }
  // When very few cards remain, TC becomes unreliable — clamp to ±15
  if (decksRemaining < 0.25) {
    return Math.max(-15, Math.min(15, runningCount * 4));
  }
  const tc = runningCount / decksRemaining;
  return Math.max(-15, Math.min(15, tc));
}

export function getDecksRemaining(
  totalCards: number,
  cardsDealt: number,
): number {
  return (totalCards - cardsDealt) / 52;
}

/**
 * For unbalanced systems, calculate the "key count" / "pivot point"
 * where the player has the advantage
 */
export function getKOKeyCount(numDecks: number): number {
  // KO key count (pivot) — the RC at which the player has the advantage.
  // For a standard 52-card deck: IRC + (number of cards × imbalance/52)
  // KO has an imbalance of +4 per deck (one extra +1 card: the 7).
  // Pivot = IRC + totalCards × (4/52) ≈ IRC + numDecks × 4
  // This simplifies to: (4 - 4*numDecks) + 4*numDecks = +4
  // In practice the standard pivot is approximately +2 to +4 depending on source.
  // Using the Fuchs & Vancura published pivots:
  switch (numDecks) {
    case 1: return +2;
    case 2: return +1;
    case 6: return +2;
    case 8: return +2;
    default: return +2;
  }
}

export function getKOInitialRC(numDecks: number): number {
  return 4 - (4 * numDecks);
}

export function getRed7InitialRC(numDecks: number): number {
  return -2 * numDecks;
}

/**
 * Calculate the player edge based on true count
 * Base house edge varies by rules; each +1 TC ≈ +0.5% player edge
 */
export function estimatePlayerEdge(
  trueCount: number,
  baseHouseEdge: number,
): number {
  return -baseHouseEdge + trueCount * 0.5;
}

/**
 * Calculate base house edge from game rules
 */
export function calculateBaseHouseEdge(rules: {
  numDecks: number;
  dealerHitsSoft17: boolean;
  doubleAfterSplit: boolean;
  surrenderAvailable: string;
  doubleOn: string;
  blackjackPays: string;
  originalBetsOnly?: boolean;
  charlieRule?: string;
  bjAfterSplitPays?: string;
  doubleAfterHit?: boolean;
}): number {
  // Start with base edge for number of decks
  let edge = 0;

  // Number of decks effect (single deck baseline = 0%)
  switch (rules.numDecks) {
    case 1: edge = 0; break;
    case 2: edge = 0.32; break;
    case 4: edge = 0.48; break;
    case 6: edge = 0.54; break;
    case 8: edge = 0.57; break;
  }

  // H17 adds ~0.22%
  if (rules.dealerHitsSoft17) edge += 0.22;

  // No DAS adds ~0.14%
  if (!rules.doubleAfterSplit) edge += 0.14;

  // Double restrictions
  if (rules.doubleOn === '10-11') edge += 0.18;
  else if (rules.doubleOn === '9-11') edge += 0.09;

  // Surrender
  if (rules.surrenderAvailable === 'late') edge -= 0.07;
  else if (rules.surrenderAvailable === 'early') edge -= 0.63;

  // Blackjack payout
  if (rules.blackjackPays === '6:5') edge += 1.39;
  else if (rules.blackjackPays === '1:1') edge += 2.27;
  else if (rules.blackjackPays === '2:1') edge -= 2.27;

  // OBO (Original Bets Only) — reduces ENHC penalty by ~0.11%
  if (rules.originalBetsOnly) edge -= 0.11;

  // Charlie rules — auto-win on N cards without busting
  if (rules.charlieRule === '5') edge -= 0.16;
  else if (rules.charlieRule === '6') edge -= 0.05;
  else if (rules.charlieRule === '7') edge -= 0.01;

  // BJ after split paying 3:2 instead of 1:1 — ~0.03% benefit
  if (rules.bjAfterSplitPays === '3:2') edge -= 0.03;

  // Double after hit — ~0.23% player benefit (very rare rule)
  if (rules.doubleAfterHit) edge -= 0.23;

  return edge;
}
