import { Action, GameRules, StrategyMatrix } from '../types';

// Dealer upcards in order
export const DEALER_CARDS = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'A'] as const;

// Hard totals (player hands 5-20)
export const HARD_TOTALS = ['20', '19', '18', '17', '16', '15', '14', '13', '12', '11', '10', '9', '8', '7', '6', '5'] as const;

// Soft totals (A2-A9)
export const SOFT_TOTALS = ['A9', 'A8', 'A7', 'A6', 'A5', 'A4', 'A3', 'A2'] as const;

// Pairs
export const PAIRS = ['AA', 'TT', '99', '88', '77', '66', '55', '44', '33', '22'] as const;

/**
 * Generate complete basic strategy based on game rules.
 * This is the mathematically correct play for every hand combination.
 */
export function generateBasicStrategy(rules: GameRules): {
  hard: StrategyMatrix;
  soft: StrategyMatrix;
  pair: StrategyMatrix;
} {
  return {
    hard: generateHardStrategy(rules),
    soft: generateSoftStrategy(rules),
    pair: generatePairStrategy(rules),
  };
}

function generateHardStrategy(rules: GameRules): StrategyMatrix {
  const { dealerHitsSoft17: h17, numDecks, doubleOn, surrenderAvailable: surr } = rules;
  const canDouble = (total: number) => {
    if (doubleOn === 'any') return true;
    if (doubleOn === '9-11') return total >= 9 && total <= 11;
    return total >= 10 && total <= 11;
  };

  const m: StrategyMatrix = {};

  // Hard 20, 19, 18: Always stand
  m['20'] = makeRow('S');
  m['19'] = makeRow('S');
  m['18'] = makeRow('S');

  // Hard 17: Always stand (with late surrender option vs A in some configs)
  if (surr === 'late' && h17) {
    m['17'] = { ...makeRow('S'), 'A': 'Rs' };
  } else {
    m['17'] = makeRow('S');
  }

  // Hard 16
  m['16'] = {
    '2': 'S', '3': 'S', '4': 'S', '5': 'S', '6': 'S',
    '7': 'H', '8': 'H', '9': surr !== 'none' ? 'Rh' : 'H',
    '10': surr !== 'none' ? 'Rh' : 'H',
    'A': surr !== 'none' ? 'Rh' : 'H',
  };

  // Hard 15
  m['15'] = {
    '2': 'S', '3': 'S', '4': 'S', '5': 'S', '6': 'S',
    '7': 'H', '8': 'H', '9': 'H',
    '10': surr !== 'none' ? 'Rh' : 'H',
    'A': surr !== 'none' && h17 ? 'Rh' : 'H',
  };

  // Hard 14
  m['14'] = {
    '2': 'S', '3': 'S', '4': 'S', '5': 'S', '6': 'S',
    '7': 'H', '8': 'H', '9': 'H', '10': 'H', 'A': 'H',
  };

  // Hard 13
  m['13'] = {
    '2': 'S', '3': 'S', '4': 'S', '5': 'S', '6': 'S',
    '7': 'H', '8': 'H', '9': 'H', '10': 'H', 'A': 'H',
  };

  // Hard 12
  m['12'] = {
    '2': 'H', '3': 'H', '4': 'S', '5': 'S', '6': 'S',
    '7': 'H', '8': 'H', '9': 'H', '10': 'H', 'A': 'H',
  };

  // Hard 11
  m['11'] = canDouble(11) ? {
    '2': 'Dh', '3': 'Dh', '4': 'Dh', '5': 'Dh', '6': 'Dh',
    '7': 'Dh', '8': 'Dh', '9': 'Dh', '10': 'Dh',
    'A': 'Dh',
  } : makeRow('H');

  // Hard 10
  m['10'] = canDouble(10) ? {
    '2': 'Dh', '3': 'Dh', '4': 'Dh', '5': 'Dh', '6': 'Dh',
    '7': 'Dh', '8': 'Dh', '9': 'Dh',
    '10': 'H', 'A': 'H',
  } : {
    '2': 'H', '3': 'H', '4': 'H', '5': 'H', '6': 'H',
    '7': 'H', '8': 'H', '9': 'H', '10': 'H', 'A': 'H',
  };

  // Hard 9
  m['9'] = canDouble(9) ? {
    '2': numDecks <= 2 ? 'Dh' : 'H',
    '3': 'Dh', '4': 'Dh', '5': 'Dh', '6': 'Dh',
    '7': 'H', '8': 'H', '9': 'H', '10': 'H', 'A': 'H',
  } : makeRow('H');

  // Hard 8
  m['8'] = {
    '2': 'H', '3': 'H', '4': 'H',
    '5': numDecks <= 2 && canDouble(8) ? 'Dh' : 'H',
    '6': numDecks <= 2 && canDouble(8) ? 'Dh' : 'H',
    '7': 'H', '8': 'H', '9': 'H', '10': 'H', 'A': 'H',
  };

  // Hard 7, 6, 5: Always hit
  m['7'] = makeRow('H');
  m['6'] = makeRow('H');
  m['5'] = makeRow('H');

  return m;
}

function generateSoftStrategy(rules: GameRules): StrategyMatrix {
  const { dealerHitsSoft17: h17, numDecks, doubleOn } = rules;
  const canDoubleAny = doubleOn === 'any';
  const m: StrategyMatrix = {};

  // Soft 20 (A9): Always stand
  m['A9'] = makeRow('S');

  // Soft 19 (A8)
  m['A8'] = {
    '2': 'S', '3': 'S', '4': 'S', '5': 'S',
    '6': h17 && canDoubleAny ? 'Ds' : 'S',
    '7': 'S', '8': 'S', '9': 'S', '10': 'S', 'A': 'S',
  };

  // Soft 18 (A7)
  m['A7'] = {
    '2': canDoubleAny ? 'Ds' : 'S',
    '3': canDoubleAny ? 'Ds' : 'S',
    '4': canDoubleAny ? 'Ds' : 'S',
    '5': canDoubleAny ? 'Ds' : 'S',
    '6': canDoubleAny ? 'Ds' : 'S',
    '7': 'S', '8': 'S',
    '9': 'H', '10': 'H',
    'A': 'H',
  };

  // Soft 17 (A6)
  m['A6'] = {
    '2': 'H',
    '3': canDoubleAny ? 'Dh' : 'H',
    '4': canDoubleAny ? 'Dh' : 'H',
    '5': canDoubleAny ? 'Dh' : 'H',
    '6': canDoubleAny ? 'Dh' : 'H',
    '7': 'H', '8': 'H', '9': 'H', '10': 'H', 'A': 'H',
  };

  // Soft 16 (A5)
  m['A5'] = {
    '2': 'H', '3': 'H',
    '4': canDoubleAny ? 'Dh' : 'H',
    '5': canDoubleAny ? 'Dh' : 'H',
    '6': canDoubleAny ? 'Dh' : 'H',
    '7': 'H', '8': 'H', '9': 'H', '10': 'H', 'A': 'H',
  };

  // Soft 15 (A4)
  m['A4'] = {
    '2': 'H', '3': 'H',
    '4': canDoubleAny ? 'Dh' : 'H',
    '5': canDoubleAny ? 'Dh' : 'H',
    '6': canDoubleAny ? 'Dh' : 'H',
    '7': 'H', '8': 'H', '9': 'H', '10': 'H', 'A': 'H',
  };

  // Soft 14 (A3)
  m['A3'] = {
    '2': 'H', '3': 'H', '4': 'H',
    '5': canDoubleAny ? 'Dh' : 'H',
    '6': canDoubleAny ? 'Dh' : 'H',
    '7': 'H', '8': 'H', '9': 'H', '10': 'H', 'A': 'H',
  };

  // Soft 13 (A2)
  m['A2'] = {
    '2': 'H', '3': 'H', '4': 'H',
    '5': canDoubleAny ? 'Dh' : 'H',
    '6': canDoubleAny ? 'Dh' : 'H',
    '7': 'H', '8': 'H', '9': 'H', '10': 'H', 'A': 'H',
  };

  return m;
}

function generatePairStrategy(rules: GameRules): StrategyMatrix {
  const {
    dealerHitsSoft17: h17, numDecks, doubleAfterSplit: das,
    surrenderAvailable: surr,
  } = rules;
  const m: StrategyMatrix = {};

  // Aces: Always split
  m['AA'] = makeRow('P');

  // Tens: Never split (always stand)
  m['TT'] = makeRow('S');

  // 9s: Split except vs 7, 10, A
  m['99'] = {
    '2': 'P', '3': 'P', '4': 'P', '5': 'P', '6': 'P',
    '7': 'S', '8': 'P', '9': 'P', '10': 'S', 'A': 'S',
  };

  // 8s: Always split (with surrender option vs A in some configs)
  if (surr !== 'none') {
    m['88'] = {
      '2': 'P', '3': 'P', '4': 'P', '5': 'P', '6': 'P',
      '7': 'P', '8': 'P', '9': 'P',
      '10': 'Rp',
      'A': 'Rp',
    };
  } else {
    m['88'] = makeRow('P');
  }

  // 7s
  m['77'] = {
    '2': 'P', '3': 'P', '4': 'P', '5': 'P', '6': 'P',
    '7': 'P', '8': 'H', '9': 'H', '10': 'H',
    'A': surr !== 'none' ? 'Rh' : 'H',
  };

  // 6s
  m['66'] = {
    '2': das ? 'P' : 'H',
    '3': 'P', '4': 'P', '5': 'P', '6': 'P',
    '7': 'H', '8': 'H', '9': 'H', '10': 'H', 'A': 'H',
  };

  // 5s: Never split (treat as hard 10)
  m['55'] = {
    '2': 'Dh', '3': 'Dh', '4': 'Dh', '5': 'Dh', '6': 'Dh',
    '7': 'Dh', '8': 'Dh', '9': 'Dh', '10': 'H', 'A': 'H',
  };

  // 4s
  m['44'] = {
    '2': 'H', '3': 'H', '4': 'H',
    '5': das ? 'P' : 'H',
    '6': das ? 'P' : 'H',
    '7': 'H', '8': 'H', '9': 'H', '10': 'H', 'A': 'H',
  };

  // 3s
  m['33'] = {
    '2': das ? 'P' : 'H',
    '3': das ? 'P' : 'H',
    '4': 'P', '5': 'P', '6': 'P', '7': 'P',
    '8': 'H', '9': 'H', '10': 'H', 'A': 'H',
  };

  // 2s
  m['22'] = {
    '2': das ? 'P' : 'H',
    '3': das ? 'P' : 'H',
    '4': 'P', '5': 'P', '6': 'P', '7': 'P',
    '8': 'H', '9': 'H', '10': 'H', 'A': 'H',
  };

  return m;
}

function makeRow(action: Action): Record<string, Action> {
  const row: Record<string, Action> = {};
  for (const dc of DEALER_CARDS) {
    row[dc] = action;
  }
  return row;
}

/**
 * Get the action color for UI display
 */
export function getActionColor(action: Action): string {
  switch (action) {
    case 'H': return '#5b9bd5';     // steel blue
    case 'S': return '#d4605a';     // muted red
    case 'D': case 'Dh': case 'Ds': return '#5dba72'; // casino green
    case 'P': return '#9b7ec8';     // soft purple
    case 'Rh': case 'Rs': case 'Rp': return '#d4a843'; // gold-amber
    default: return '#6b6355';
  }
}

/**
 * Get human-readable action name
 */
export function getActionName(action: Action): string {
  switch (action) {
    case 'H': return 'Hit';
    case 'S': return 'Stand';
    case 'D': return 'Double';
    case 'Dh': return 'Double/Hit';
    case 'Ds': return 'Double/Stand';
    case 'P': return 'Split';
    case 'Rh': return 'Surrender/Hit';
    case 'Rs': return 'Surrender/Stand';
    case 'Rp': return 'Surrender/Split';
    default: return action;
  }
}
