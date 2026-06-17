import {
  COUNTING_SYSTEMS,
  calculateTrueCount,
  calculateBaseHouseEdge,
  estimateTrueCount,
  getDecksRemaining,
  getImbalancePerDeck,
  getInitialRunningCount,
  getKOInitialRC,
  getRed7InitialRC,
} from '../countingSystems';
import { Card, GameRules } from '../../types';

const BASE_RULES: GameRules = {
  numDecks: 6,
  dealerHitsSoft17: true,
  doubleAfterSplit: true,
  surrenderAvailable: 'late',
  doubleOn: 'any',
  resplitAces: false,
  hitSplitAces: false,
  maxSplitHands: 4,
  blackjackPays: '3:2',
  dealerPeeks: true,
  originalBetsOnly: false,
  charlieRule: 'none',
  bjAfterSplitPays: '1:1',
  csm: false,
  penetration: 0.75,
  doubleAfterHit: false,
};

const ALL_CARDS: Card[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

describe('counting system tag values', () => {
  test('balanced systems sum to zero over a full deck', () => {
    for (const system of Object.values(COUNTING_SYSTEMS)) {
      if (!system.balanced) continue;
      // 4 copies of each rank per deck
      const deckSum = ALL_CARDS.reduce((sum, card) => sum + system.values[card] * 4, 0);
      expect(deckSum).toBeCloseTo(0);
    }
  });

  test('unbalanced systems sum to their published per-deck imbalance', () => {
    for (const system of Object.values(COUNTING_SYSTEMS)) {
      if (system.balanced) continue;
      const deckSum = ALL_CARDS.reduce((sum, card) => sum + system.values[card] * 4, 0);
      expect(deckSum).toBeCloseTo(getImbalancePerDeck(system.id));
    }
  });
});

describe('calculateTrueCount', () => {
  const hiLo = COUNTING_SYSTEMS['hi-lo'];

  test('divides RC by decks remaining for balanced systems', () => {
    expect(calculateTrueCount(6, 3, hiLo)).toBeCloseTo(2);
    expect(calculateTrueCount(-4, 2, hiLo)).toBeCloseTo(-2);
  });

  test('clamps to ±15', () => {
    expect(calculateTrueCount(100, 1, hiLo)).toBe(15);
    expect(calculateTrueCount(-100, 1, hiLo)).toBe(-15);
  });

  test('returns RC unchanged for unbalanced systems', () => {
    expect(calculateTrueCount(-20, 6, COUNTING_SYSTEMS['ko'])).toBe(-20);
  });
});

describe('initial running counts (published IRCs)', () => {
  test('KO: IRC = 4 − 4 × decks (Fuchs & Vancura)', () => {
    expect(getKOInitialRC(1)).toBe(0);
    expect(getKOInitialRC(2)).toBe(-4);
    expect(getKOInitialRC(6)).toBe(-20);
    expect(getKOInitialRC(8)).toBe(-28);
  });

  test('Red 7: IRC = −2 × decks (Snyder)', () => {
    expect(getRed7InitialRC(1)).toBe(-2);
    expect(getRed7InitialRC(6)).toBe(-12);
  });

  test('balanced systems start at 0', () => {
    expect(getInitialRunningCount('hi-lo', 6)).toBe(0);
    expect(getInitialRunningCount('wong-halves', 8)).toBe(0);
  });
});

describe('estimateTrueCount (unbalanced → balanced-equivalent TC)', () => {
  test('fresh KO shoe is TC 0', () => {
    // RC starts at the IRC with nothing dealt
    expect(estimateTrueCount(getKOInitialRC(6), 'ko', 6, 6)).toBeCloseTo(0);
  });

  test('KO pivot (RC +4) is TC +4 at any depth', () => {
    // The KO pivot is calibrated to a Hi-Lo TC of +4 regardless of penetration
    for (const decksRemaining of [6, 4, 2, 1]) {
      expect(estimateTrueCount(4, 'ko', 6, decksRemaining)).toBeCloseTo(4);
    }
  });

  test('Red 7 pivot (RC 0) is TC +2 at any depth', () => {
    for (const decksRemaining of [6, 3, 1]) {
      expect(estimateTrueCount(0, 'red-7', 6, decksRemaining)).toBeCloseTo(2);
    }
  });

  test('balanced systems fall through to the standard conversion', () => {
    expect(estimateTrueCount(6, 'hi-lo', 6, 3)).toBeCloseTo(2);
  });
});

describe('calculateBaseHouseEdge', () => {
  test('6-deck H17 DAS LS 3:2 ≈ 0.69%', () => {
    // 0.54 (6 decks) + 0.22 (H17) − 0.07 (late surrender)
    expect(calculateBaseHouseEdge(BASE_RULES)).toBeCloseTo(0.69);
  });

  test('6:5 blackjack adds 1.39%', () => {
    const edge65 = calculateBaseHouseEdge({ ...BASE_RULES, blackjackPays: '6:5' });
    expect(edge65 - calculateBaseHouseEdge(BASE_RULES)).toBeCloseTo(1.39);
  });

  test('single-deck S17 with no extras is the 0% baseline', () => {
    const edge = calculateBaseHouseEdge({
      ...BASE_RULES,
      numDecks: 1,
      dealerHitsSoft17: false,
      surrenderAvailable: 'none',
    });
    expect(edge).toBeCloseTo(0);
  });
});

describe('getDecksRemaining', () => {
  test('converts dealt cards to remaining decks', () => {
    expect(getDecksRemaining(312, 52)).toBeCloseTo(5);
    expect(getDecksRemaining(312, 0)).toBeCloseTo(6);
  });
});
