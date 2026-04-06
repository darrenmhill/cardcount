import { Card, Action, CountingSystemId } from '../types';
import { COUNTING_SYSTEMS, calculateTrueCount } from './countingSystems';
import { generateBasicStrategy, DEALER_CARDS } from './basicStrategy';
import { ALL_DEVIATIONS, getActiveDeviations, getEffectiveIndex } from './deviations';
import { GameRules } from '../types';

const ALL_CARDS: Card[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

/** Generate a random card */
export function randomCard(): Card {
  return ALL_CARDS[Math.floor(Math.random() * ALL_CARDS.length)];
}

/** Generate a sequence of random cards for speed counting */
export function generateDeck(count: number): Card[] {
  return Array.from({ length: count }, () => randomCard());
}

/** Calculate the correct running count for a sequence */
export function correctRunningCount(cards: Card[], systemId: CountingSystemId): number {
  const system = COUNTING_SYSTEMS[systemId];
  return cards.reduce((sum, card) => sum + system.values[card], 0);
}

// ---- Basic Strategy Quiz ----

export interface StrategyQuestion {
  playerTotal: string;
  handType: 'hard' | 'soft' | 'pair';
  dealerUpcard: string;
  correctAction: Action;
}

export function generateStrategyQuestion(rules: GameRules): StrategyQuestion {
  const strategy = generateBasicStrategy(rules);
  const handType = (['hard', 'soft', 'pair'] as const)[Math.floor(Math.random() * 3)];

  let rows: readonly string[];
  if (handType === 'hard') rows = ['20','19','18','17','16','15','14','13','12','11','10','9','8'];
  else if (handType === 'soft') rows = ['A9','A8','A7','A6','A5','A4','A3','A2'];
  else rows = ['AA','TT','99','88','77','66','55','44','33','22'];

  const playerTotal = rows[Math.floor(Math.random() * rows.length)];
  const dealerUpcard = DEALER_CARDS[Math.floor(Math.random() * DEALER_CARDS.length)];
  const correctAction = strategy[handType][playerTotal]?.[dealerUpcard] || 'H';

  return { playerTotal, handType, dealerUpcard, correctAction: correctAction as Action };
}

// ---- Deviation Quiz ----

export interface DeviationQuestion {
  playerHand: string;
  dealerUpcard: string;
  trueCount: number;
  shouldDeviate: boolean;
  deviationName: string;
  normalAction: Action;
  correctAction: Action;
}

export function generateDeviationQuestion(
  rules: GameRules,
  systemId: CountingSystemId,
): DeviationQuestion {
  // Pick a random deviation (exclude insurance which has no specific hand)
  const eligible = ALL_DEVIATIONS.filter(d => d.playerHand !== 'any');
  const dev = eligible[Math.floor(Math.random() * eligible.length)];

  const effectiveIdx = getEffectiveIndex(dev, systemId, rules.numDecks, rules.numDecks * 0.5);

  // Randomly decide if TC should trigger the deviation or not
  const shouldDeviate = Math.random() > 0.5;
  let trueCount: number;
  if (shouldDeviate) {
    trueCount = dev.direction === '>='
      ? effectiveIdx + Math.floor(Math.random() * 3)
      : effectiveIdx - Math.floor(Math.random() * 3);
  } else {
    trueCount = dev.direction === '>='
      ? effectiveIdx - 1 - Math.floor(Math.random() * 3)
      : effectiveIdx + 1 + Math.floor(Math.random() * 3);
  }

  return {
    playerHand: dev.playerHand,
    dealerUpcard: dev.dealerUpcard,
    trueCount,
    shouldDeviate,
    deviationName: dev.name,
    normalAction: dev.normalAction,
    correctAction: shouldDeviate ? dev.deviationAction : dev.normalAction,
  };
}

// ---- TC Conversion Drill ----

export interface TCConversionQuestion {
  runningCount: number;
  decksRemaining: number;
  correctTC: number;
}

export function generateTCQuestion(): TCConversionQuestion {
  const runningCount = Math.floor(Math.random() * 21) - 10; // -10 to +10
  const decksRemaining = [0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 5, 6][
    Math.floor(Math.random() * 10)
  ];
  const correctTC = Math.round((runningCount / decksRemaining) * 2) / 2; // round to 0.5
  return { runningCount, decksRemaining, correctTC };
}

// ---- Performance Tracking ----

export interface DrillResult {
  type: 'speed' | 'strategy' | 'deviation' | 'tc-conversion';
  timestamp: number;
  correct: number;
  total: number;
  durationMs: number;
}

export interface PerformanceStats {
  totalDrills: number;
  totalCorrect: number;
  totalQuestions: number;
  accuracy: number;
  byType: Record<string, { correct: number; total: number; accuracy: number }>;
  recentResults: DrillResult[];
}

export function calculatePerformanceStats(results: DrillResult[]): PerformanceStats {
  const totalCorrect = results.reduce((s, r) => s + r.correct, 0);
  const totalQuestions = results.reduce((s, r) => s + r.total, 0);

  const byType: Record<string, { correct: number; total: number; accuracy: number }> = {};
  for (const r of results) {
    if (!byType[r.type]) byType[r.type] = { correct: 0, total: 0, accuracy: 0 };
    byType[r.type].correct += r.correct;
    byType[r.type].total += r.total;
  }
  for (const key of Object.keys(byType)) {
    byType[key].accuracy = byType[key].total > 0 ? byType[key].correct / byType[key].total * 100 : 0;
  }

  return {
    totalDrills: results.length,
    totalCorrect,
    totalQuestions,
    accuracy: totalQuestions > 0 ? totalCorrect / totalQuestions * 100 : 0,
    byType,
    recentResults: results.slice(-20),
  };
}
