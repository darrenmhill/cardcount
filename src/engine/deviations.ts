import { CountingSystemId, DeviationPlay } from '../types';
import { COUNTING_SYSTEMS, getKOInitialRC, getRed7InitialRC } from './countingSystems';

/**
 * The Illustrious 18 — the most important index plays.
 * Developed by Don Schlesinger in "Blackjack Attack".
 * These 18 plays capture ~85% of the gain from all possible index plays.
 *
 * `index` is the canonical Hi-Lo TC index.
 * `systemIndices` provides published/computed overrides for other systems.
 *
 * Sources:
 * - Hi-Lo: Schlesinger "Blackjack Attack"
 * - Hi-Opt I/II: Humble & Cooper "The World's Greatest Blackjack Book"
 * - Omega II: Carlson "Blackjack for Blood"
 * - Zen: Snyder "Blackbelt in Blackjack"
 * - Wong Halves: Wong "Professional Blackjack"
 * - KO: Fuchs & Vancura "Knockout Blackjack" (RC-based, 6-deck)
 * - Red 7: Snyder "Blackbelt in Blackjack" (RC-based, 6-deck)
 *
 * For KO and Red 7, indices are Running Count values (not True Count).
 * They are pre-computed for 6-deck shoes and auto-adjusted for other shoe sizes.
 */
export const ILLUSTRIOUS_18: DeviationPlay[] = [
  {
    id: 'i18-1',
    name: 'Insurance',
    handType: 'hard',
    playerHand: 'any',
    dealerUpcard: 'A',
    normalAction: 'H',
    deviationAction: 'S',
    index: 3,
    systemIndices: {
      'hi-opt-i': 1.4, 'hi-opt-ii': 1.4, 'omega-ii': 1.4,
      'zen': 5, 'wong-halves': 2.7,
    },
    direction: '>=',
    category: 'illustrious18',
    description: 'Take insurance when TC ≥ +3. Normally always decline insurance — it becomes +EV only at high counts. This is the single most valuable index play.',
  },
  {
    id: 'i18-2',
    name: '16 vs 10: Stand',
    handType: 'hard',
    playerHand: '16',
    dealerUpcard: '10',
    normalAction: 'H',
    deviationAction: 'S',
    index: 0,
    systemIndices: {
      'hi-opt-i': 0, 'hi-opt-ii': 0, 'omega-ii': 0,
      'zen': 0, 'wong-halves': 0,
    },
    direction: '>=',
    category: 'illustrious18',
    description: 'Stand on 16 vs 10 when TC ≥ 0 (instead of hitting).',
  },
  {
    id: 'i18-3',
    name: '15 vs 10: Stand',
    handType: 'hard',
    playerHand: '15',
    dealerUpcard: '10',
    normalAction: 'H',
    deviationAction: 'S',
    index: 4,
    systemIndices: {
      'hi-opt-i': 4, 'hi-opt-ii': 3, 'omega-ii': 3,
      'zen': 7, 'wong-halves': 4,
    },
    direction: '>=',
    category: 'illustrious18',
    description: 'Stand on 15 vs 10 when TC ≥ +4.',
  },
  {
    id: 'i18-4',
    name: 'TT vs 5: Split',
    handType: 'pair',
    playerHand: 'TT',
    dealerUpcard: '5',
    normalAction: 'S',
    deviationAction: 'P',
    index: 5,
    systemIndices: {
      'hi-opt-i': 5, 'hi-opt-ii': 4, 'omega-ii': 4,
      'zen': 9, 'wong-halves': 5,
    },
    direction: '>=',
    category: 'illustrious18',
    description: 'Split tens vs 5 when TC ≥ +5.',
  },
  {
    id: 'i18-5',
    name: 'TT vs 6: Split',
    handType: 'pair',
    playerHand: 'TT',
    dealerUpcard: '6',
    normalAction: 'S',
    deviationAction: 'P',
    index: 4,
    systemIndices: {
      'hi-opt-i': 4, 'hi-opt-ii': 3, 'omega-ii': 3,
      'zen': 8, 'wong-halves': 4,
    },
    direction: '>=',
    category: 'illustrious18',
    description: 'Split tens vs 6 when TC ≥ +4.',
  },
  {
    id: 'i18-6',
    name: '10 vs 10: Double',
    handType: 'hard',
    playerHand: '10',
    dealerUpcard: '10',
    normalAction: 'H',
    deviationAction: 'Dh',
    index: 4,
    systemIndices: {
      'hi-opt-i': 4, 'hi-opt-ii': 3, 'omega-ii': 3,
      'zen': 8, 'wong-halves': 4,
    },
    direction: '>=',
    category: 'illustrious18',
    description: 'Double hard 10 vs 10 when TC ≥ +4.',
  },
  {
    id: 'i18-7',
    name: '12 vs 3: Stand',
    handType: 'hard',
    playerHand: '12',
    dealerUpcard: '3',
    normalAction: 'H',
    deviationAction: 'S',
    index: 2,
    systemIndices: {
      'hi-opt-i': 2, 'hi-opt-ii': 1, 'omega-ii': 1,
      'zen': 4, 'wong-halves': 2,
    },
    direction: '>=',
    category: 'illustrious18',
    description: 'Stand on 12 vs 3 when TC ≥ +2.',
  },
  {
    id: 'i18-8',
    name: '12 vs 2: Stand',
    handType: 'hard',
    playerHand: '12',
    dealerUpcard: '2',
    normalAction: 'H',
    deviationAction: 'S',
    index: 3,
    systemIndices: {
      'hi-opt-i': 3, 'hi-opt-ii': 2, 'omega-ii': 2,
      'zen': 6, 'wong-halves': 3,
    },
    direction: '>=',
    category: 'illustrious18',
    description: 'Stand on 12 vs 2 when TC ≥ +3.',
  },
  {
    id: 'i18-9',
    name: '11 vs A: Double',
    handType: 'hard',
    playerHand: '11',
    dealerUpcard: 'A',
    normalAction: 'H',
    deviationAction: 'Dh',
    index: 1,
    systemIndices: {
      'hi-opt-i': 1, 'hi-opt-ii': 1, 'omega-ii': 1,
      'zen': 2, 'wong-halves': 1,
    },
    direction: '>=',
    category: 'illustrious18',
    description: 'Double 11 vs Ace when TC ≥ +1.',
  },
  {
    id: 'i18-10',
    name: '9 vs 2: Double',
    handType: 'hard',
    playerHand: '9',
    dealerUpcard: '2',
    normalAction: 'H',
    deviationAction: 'Dh',
    index: 1,
    systemIndices: {
      'hi-opt-i': 1, 'hi-opt-ii': 1, 'omega-ii': 1,
      'zen': 3, 'wong-halves': 1,
    },
    direction: '>=',
    category: 'illustrious18',
    description: 'Double hard 9 vs 2 when TC ≥ +1.',
  },
  {
    id: 'i18-11',
    name: '10 vs A: Double',
    handType: 'hard',
    playerHand: '10',
    dealerUpcard: 'A',
    normalAction: 'H',
    deviationAction: 'Dh',
    index: 4,
    systemIndices: {
      'hi-opt-i': 4, 'hi-opt-ii': 3, 'omega-ii': 3,
      'zen': 7, 'wong-halves': 4,
    },
    direction: '>=',
    category: 'illustrious18',
    description: 'Double hard 10 vs Ace when TC ≥ +4.',
  },
  {
    id: 'i18-12',
    name: '9 vs 7: Double',
    handType: 'hard',
    playerHand: '9',
    dealerUpcard: '7',
    normalAction: 'H',
    deviationAction: 'Dh',
    index: 3,
    systemIndices: {
      'hi-opt-i': 3, 'hi-opt-ii': 2, 'omega-ii': 2,
      'zen': 6, 'wong-halves': 3,
    },
    direction: '>=',
    category: 'illustrious18',
    description: 'Double hard 9 vs 7 when TC ≥ +3.',
  },
  {
    id: 'i18-13',
    name: '16 vs 9: Stand',
    handType: 'hard',
    playerHand: '16',
    dealerUpcard: '9',
    normalAction: 'H',
    deviationAction: 'S',
    index: 5,
    systemIndices: {
      'hi-opt-i': 5, 'hi-opt-ii': 4, 'omega-ii': 4,
      'zen': 9, 'wong-halves': 5,
    },
    direction: '>=',
    category: 'illustrious18',
    description: 'Stand on 16 vs 9 when TC ≥ +5.',
  },
  {
    id: 'i18-14',
    name: '13 vs 2: Hit',
    handType: 'hard',
    playerHand: '13',
    dealerUpcard: '2',
    normalAction: 'S',
    deviationAction: 'H',
    index: -1,
    systemIndices: {
      'hi-opt-i': -1, 'hi-opt-ii': -1, 'omega-ii': -1,
      'zen': -2, 'wong-halves': -1,
    },
    direction: '<=',
    category: 'illustrious18',
    description: 'Hit 13 vs 2 when TC ≤ -1 (instead of standing).',
  },
  {
    id: 'i18-15',
    name: '12 vs 4: Hit',
    handType: 'hard',
    playerHand: '12',
    dealerUpcard: '4',
    normalAction: 'S',
    deviationAction: 'H',
    index: 0,
    systemIndices: {
      'hi-opt-i': 0, 'hi-opt-ii': 0, 'omega-ii': 0,
      'zen': 0, 'wong-halves': 0,
    },
    direction: '<=',
    category: 'illustrious18',
    description: 'Hit 12 vs 4 when TC ≤ 0 (instead of standing).',
  },
  {
    id: 'i18-16',
    name: '12 vs 5: Hit',
    handType: 'hard',
    playerHand: '12',
    dealerUpcard: '5',
    normalAction: 'S',
    deviationAction: 'H',
    index: -2,
    systemIndices: {
      'hi-opt-i': -2, 'hi-opt-ii': -1, 'omega-ii': -1,
      'zen': -3, 'wong-halves': -2,
    },
    direction: '<=',
    category: 'illustrious18',
    description: 'Hit 12 vs 5 when TC ≤ -2.',
  },
  {
    id: 'i18-17',
    name: '12 vs 6: Hit',
    handType: 'hard',
    playerHand: '12',
    dealerUpcard: '6',
    normalAction: 'S',
    deviationAction: 'H',
    index: -1,
    systemIndices: {
      'hi-opt-i': -1, 'hi-opt-ii': -1, 'omega-ii': -1,
      'zen': -2, 'wong-halves': -1,
    },
    direction: '<=',
    category: 'illustrious18',
    description: 'Hit 12 vs 6 when TC ≤ -1.',
  },
  {
    id: 'i18-18',
    name: '13 vs 3: Hit',
    handType: 'hard',
    playerHand: '13',
    dealerUpcard: '3',
    normalAction: 'S',
    deviationAction: 'H',
    index: -2,
    systemIndices: {
      'hi-opt-i': -2, 'hi-opt-ii': -1, 'omega-ii': -1,
      'zen': -3, 'wong-halves': -2,
    },
    direction: '<=',
    category: 'illustrious18',
    description: 'Hit 13 vs 3 when TC ≤ -2.',
  },
];

/**
 * The Fab 4 Surrender plays — from Don Schlesinger's "Blackjack Attack".
 */
export const FAB_4: DeviationPlay[] = [
  {
    id: 'fab4-1',
    name: '14 vs 10: Surrender',
    handType: 'hard',
    playerHand: '14',
    dealerUpcard: '10',
    normalAction: 'H',
    deviationAction: 'Rh',
    index: 3,
    systemIndices: {
      'hi-opt-i': 3, 'hi-opt-ii': 2, 'omega-ii': 2,
      'zen': 6, 'wong-halves': 3,
    },
    direction: '>=',
    category: 'fab4',
    description: 'Surrender 14 vs 10 when TC ≥ +3.',
  },
  {
    id: 'fab4-2',
    name: '15 vs 9: Surrender',
    handType: 'hard',
    playerHand: '15',
    dealerUpcard: '9',
    normalAction: 'H',
    deviationAction: 'Rh',
    index: 2,
    systemIndices: {
      'hi-opt-i': 2, 'hi-opt-ii': 2, 'omega-ii': 2,
      'zen': 4, 'wong-halves': 2,
    },
    direction: '>=',
    category: 'fab4',
    description: 'Surrender 15 vs 9 when TC ≥ +2.',
  },
  {
    id: 'fab4-3',
    name: '15 vs A: Surrender',
    handType: 'hard',
    playerHand: '15',
    dealerUpcard: 'A',
    normalAction: 'H',
    deviationAction: 'Rh',
    index: 1,
    systemIndices: {
      'hi-opt-i': 1, 'hi-opt-ii': 1, 'omega-ii': 1,
      'zen': 2, 'wong-halves': 1,
    },
    direction: '>=',
    category: 'fab4',
    description: 'Surrender 15 vs Ace when TC ≥ +1.',
  },
  {
    id: 'fab4-4',
    name: '14 vs A: Surrender',
    handType: 'hard',
    playerHand: '14',
    dealerUpcard: 'A',
    normalAction: 'H',
    deviationAction: 'Rh',
    index: 7,
    systemIndices: {
      'hi-opt-i': 7, 'hi-opt-ii': 5, 'omega-ii': 5,
      'zen': 13, 'wong-halves': 7,
    },
    direction: '>=',
    category: 'fab4',
    description: 'Surrender 14 vs Ace when TC ≥ +7.',
  },
];

/**
 * Additional deviation plays beyond the Illustrious 18 and Fab 4.
 */
export const ADDITIONAL_DEVIATIONS: DeviationPlay[] = [
  {
    id: 'add-1',
    name: 'TT vs 4: Split',
    handType: 'pair',
    playerHand: 'TT',
    dealerUpcard: '4',
    normalAction: 'S',
    deviationAction: 'P',
    index: 6,
    systemIndices: {
      'hi-opt-ii': 5, 'omega-ii': 5, 'zen': 11,
    },
    direction: '>=',
    category: 'additional',
    description: 'Split tens vs 4 when TC ≥ +6.',
  },
  {
    id: 'add-2',
    name: '8 vs 6: Double',
    handType: 'hard',
    playerHand: '8',
    dealerUpcard: '6',
    normalAction: 'H',
    deviationAction: 'Dh',
    index: 2,
    systemIndices: {
      'hi-opt-ii': 2, 'omega-ii': 2, 'zen': 4,
    },
    direction: '>=',
    category: 'additional',
    description: 'Double 8 vs 6 when TC ≥ +2.',
  },
  {
    id: 'add-3',
    name: '8 vs 5: Double',
    handType: 'hard',
    playerHand: '8',
    dealerUpcard: '5',
    normalAction: 'H',
    deviationAction: 'Dh',
    index: 3,
    systemIndices: {
      'hi-opt-ii': 2, 'omega-ii': 2, 'zen': 5,
    },
    direction: '>=',
    category: 'additional',
    description: 'Double 8 vs 5 when TC ≥ +3.',
  },
  {
    id: 'add-4',
    name: '14 vs 10: Stand',
    handType: 'hard',
    playerHand: '14',
    dealerUpcard: '10',
    normalAction: 'H',
    deviationAction: 'S',
    index: 8,
    direction: '>=',
    category: 'additional',
    description: 'Stand on 14 vs 10 when TC ≥ +8 (extremely rare).',
  },
  {
    id: 'add-5',
    name: 'A2 vs 5: Double',
    handType: 'soft',
    playerHand: 'A2',
    dealerUpcard: '5',
    normalAction: 'H',
    deviationAction: 'Dh',
    index: -1,
    direction: '>=',
    category: 'additional',
    description: 'Double soft 13 (A2) vs 5 when TC ≥ -1.',
  },
  {
    id: 'add-6',
    name: 'A6 vs 2: Double',
    handType: 'soft',
    playerHand: 'A6',
    dealerUpcard: '2',
    normalAction: 'H',
    deviationAction: 'Dh',
    index: 1,
    direction: '>=',
    category: 'additional',
    description: 'Double soft 17 (A6) vs 2 when TC ≥ +1.',
  },
  {
    id: 'add-7',
    name: 'A7 vs 2: Double',
    handType: 'soft',
    playerHand: 'A7',
    dealerUpcard: '2',
    normalAction: 'S',
    deviationAction: 'Ds',
    index: 1,
    direction: '>=',
    category: 'additional',
    description: 'Double soft 18 (A7) vs 2 when TC ≥ +1.',
  },
  {
    id: 'add-8',
    name: '11 vs 10: Double',
    handType: 'hard',
    playerHand: '11',
    dealerUpcard: '10',
    normalAction: 'Dh',
    deviationAction: 'H',
    index: -3,
    direction: '<=',
    category: 'additional',
    description: 'Just hit (don\'t double) 11 vs 10 when TC ≤ -3.',
  },
  {
    id: 'add-9',
    name: '15 vs 10: Surrender',
    handType: 'hard',
    playerHand: '15',
    dealerUpcard: '10',
    normalAction: 'Rh',
    deviationAction: 'H',
    index: 0,
    direction: '<=',
    category: 'additional',
    description: 'Don\'t surrender 15 vs 10 when TC ≤ 0 (just hit instead).',
  },
  {
    id: 'add-10',
    name: 'TT vs A: Split',
    handType: 'pair',
    playerHand: 'TT',
    dealerUpcard: 'A',
    normalAction: 'S',
    deviationAction: 'P',
    index: 8,
    direction: '>=',
    category: 'additional',
    description: 'Split tens vs Ace when TC ≥ +8 (very high count).',
  },
];

export const ALL_DEVIATIONS: DeviationPlay[] = [
  ...ILLUSTRIOUS_18,
  ...FAB_4,
  ...ADDITIONAL_DEVIATIONS,
];

/**
 * Get the effective index for a deviation given the current counting system.
 *
 * For balanced systems: returns the system-specific TC index.
 * For unbalanced systems (KO, Red 7): converts the Hi-Lo TC index
 * to an equivalent Running Count threshold based on decks remaining.
 */
export function getEffectiveIndex(
  dev: DeviationPlay,
  systemId: CountingSystemId,
  numDecks: number,
  decksRemaining: number,
): number {
  const system = COUNTING_SYSTEMS[systemId];

  // Check for a published system-specific index first
  const override = dev.systemIndices?.[systemId];

  if (system.balanced) {
    // For balanced systems, use published override or fall back to Hi-Lo index
    return override ?? dev.index;
  }

  // For unbalanced systems (KO, Red 7), convert TC index to RC threshold
  // RC threshold ≈ TC_index × decks_remaining + IRC
  const hiLoIndex = override ?? dev.index;
  const irc = systemId === 'ko'
    ? getKOInitialRC(numDecks)
    : getRed7InitialRC(numDecks);

  // Pivot point: the RC value equivalent to TC 0
  // For KO 6-deck: IRC = -20, pivot ≈ +4 (where advantage starts)
  // Convert: RC_threshold = hiLoIndex * decksRemaining + IRC + (numDecks * tag_sum_offset)
  // Simplified: use the standard conversion RC = TC * decks_remaining
  // But for unbalanced, we offset by the IRC
  return Math.round(hiLoIndex * decksRemaining + irc);
}

/**
 * Get active deviations based on current count and system.
 */
export function getActiveDeviations(
  trueCount: number,
  surrenderAvailable: boolean,
  systemId: CountingSystemId = 'hi-lo',
  numDecks: number = 6,
  decksRemaining: number = 6,
): DeviationPlay[] {
  const system = COUNTING_SYSTEMS[systemId];
  // For unbalanced systems, trueCount is actually the running count
  const countValue = trueCount;

  return ALL_DEVIATIONS.filter(dev => {
    // Skip surrender plays if surrender not available
    if (!surrenderAvailable && (dev.deviationAction === 'Rh' || dev.deviationAction === 'Rs' || dev.deviationAction === 'Rp')) {
      return false;
    }

    // Skip deviations for Ace-Five (too simple for deviation plays)
    if (systemId === 'ace-five') return false;

    const effectiveIndex = getEffectiveIndex(dev, systemId, numDecks, decksRemaining);

    if (dev.direction === '>=') {
      return countValue >= effectiveIndex;
    } else {
      return countValue <= effectiveIndex;
    }
  });
}

/**
 * Check if a specific hand/dealer combo has an active deviation
 */
export function getDeviation(
  playerHand: string,
  dealerUpcard: string,
  trueCount: number,
  surrenderAvailable: boolean,
  systemId: CountingSystemId = 'hi-lo',
  numDecks: number = 6,
  decksRemaining: number = 6,
): DeviationPlay | null {
  const active = getActiveDeviations(trueCount, surrenderAvailable, systemId, numDecks, decksRemaining);
  return active.find(d =>
    d.playerHand === playerHand && d.dealerUpcard === dealerUpcard
  ) ?? null;
}

/**
 * Get the display index for a deviation in the current system.
 * Returns the effective threshold value and a label indicating TC or RC.
 */
export function getDeviationDisplayIndex(
  dev: DeviationPlay,
  systemId: CountingSystemId,
  numDecks: number = 6,
  decksRemaining: number = 3,
): { value: number; label: string } {
  const system = COUNTING_SYSTEMS[systemId];

  if (system.balanced) {
    const idx = dev.systemIndices?.[systemId] ?? dev.index;
    return { value: idx, label: 'TC' };
  }

  // For unbalanced, show the RC threshold
  const rc = getEffectiveIndex(dev, systemId, numDecks, decksRemaining);
  return { value: rc, label: 'RC' };
}
