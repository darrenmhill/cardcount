// Card counting system types

export type Card = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';
export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';

export type CountingSystemId =
  | 'hi-lo'
  | 'hi-opt-i'
  | 'hi-opt-ii'
  | 'omega-ii'
  | 'zen'
  | 'wong-halves'
  | 'ko'
  | 'red-7'
  | 'ace-five';

export interface CountingSystem {
  id: CountingSystemId;
  name: string;
  description: string;
  level: number; // 1 = single-level, 2 = multi-level, etc.
  balanced: boolean; // true = sums to 0 for full deck
  values: Record<Card, number>;
  sideCountAces: boolean; // whether system requires separate ace count
  insuranceIndex: number; // true count at which insurance becomes +EV
}

export type Action = 'H' | 'S' | 'D' | 'P' | 'Dh' | 'Ds' | 'Rh' | 'Rs' | 'Rp';
// H=Hit, S=Stand, D=Double, P=Split
// Dh=Double if allowed else Hit, Ds=Double if allowed else Stand
// Rh=Surrender if allowed else Hit, Rs=Surrender if allowed else Stand
// Rp=Surrender if allowed else Split

export interface GameRules {
  numDecks: 1 | 2 | 4 | 6 | 8;
  dealerHitsSoft17: boolean; // H17 vs S17
  doubleAfterSplit: boolean; // DAS
  surrenderAvailable: 'none' | 'late' | 'early';
  doubleOn: 'any' | '9-11' | '10-11'; // what totals can double on
  resplitAces: boolean;
  hitSplitAces: boolean;
  maxSplitHands: 2 | 3 | 4; // max hands from splits
  blackjackPays: '3:2' | '6:5' | '1:1' | '2:1';
  dealerPeeks: boolean; // peek for BJ (American style)
  originalBetsOnly: boolean; // OBO — ENHC: lose only original bet to dealer BJ
  charlieRule: 'none' | '5' | '6' | '7'; // N-card charlie auto-win
  bjAfterSplitPays: '3:2' | '1:1'; // does 21 after split pay BJ odds?
  csm: boolean; // Continuous Shuffling Machine (counting useless)
  penetration: number; // 0.0-1.0, typical 0.75
  doubleAfterHit: boolean; // can double after taking a hit (rare, some EU)
}

export type HandType = 'hard' | 'soft' | 'pair';

export interface DeviationPlay {
  id: string;
  name: string;
  handType: HandType;
  playerHand: string; // e.g. "16", "A7", "TT"
  dealerUpcard: string; // e.g. "10", "A"
  normalAction: Action;
  deviationAction: Action;
  index: number; // Hi-Lo true count threshold (canonical)
  systemIndices?: Partial<Record<CountingSystemId, number>>; // per-system overrides
  direction: '>=' | '<='; // deviate when TC >= or <= index
  category: 'illustrious18' | 'fab4' | 'additional';
  description: string;
}

export interface SessionStats {
  handsPlayed: number;
  runningCount: number;
  trueCount: number;
  cardsDealt: number;
  cardsRemaining: number;
  decksRemaining: number;
  activeDeviations: DeviationPlay[];
  recommendedBetUnits: number;
  edgePercent: number;
}

export type StrategyMatrix = Record<string, Record<string, Action>>;

export interface BettingSpread {
  trueCount: number;
  units: number;
  description: string;
}
