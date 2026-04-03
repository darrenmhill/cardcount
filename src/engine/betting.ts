import { BettingSpread, GameRules } from '../types';
import { calculateBaseHouseEdge } from './countingSystems';

/**
 * Generate recommended betting spread based on true count.
 * Uses the classic 1-12 spread for shoe games and 1-8 for double deck.
 */
export function getRecommendedBet(
  trueCount: number,
  numDecks: number,
): { units: number; description: string } {
  if (numDecks <= 2) {
    // Tighter spread for pitch games (1-8)
    if (trueCount <= 0) return { units: 1, description: 'Minimum bet — negative/neutral count' };
    if (trueCount === 1) return { units: 2, description: 'Slight advantage' };
    if (trueCount === 2) return { units: 4, description: 'Moderate advantage' };
    if (trueCount === 3) return { units: 6, description: 'Good advantage' };
    return { units: 8, description: 'Strong advantage — max bet' };
  }

  // Shoe game spread (1-12)
  if (trueCount <= 0) return { units: 1, description: 'Minimum bet — negative/neutral count' };
  if (trueCount === 1) return { units: 2, description: 'Slight advantage — 2 units' };
  if (trueCount === 2) return { units: 4, description: 'Moderate advantage — 4 units' };
  if (trueCount === 3) return { units: 6, description: 'Good advantage — 6 units' };
  if (trueCount === 4) return { units: 8, description: 'Strong advantage — 8 units' };
  if (trueCount >= 5) return { units: 12, description: 'Very strong — max spread' };

  return { units: 1, description: 'Minimum bet' };
}

/**
 * Full betting spread table for display
 */
export function getBettingSpreadTable(numDecks: number): BettingSpread[] {
  if (numDecks <= 2) {
    return [
      { trueCount: -99, units: 1, description: 'TC ≤ 0: Minimum (consider leaving table if very negative)' },
      { trueCount: 1, units: 2, description: 'TC +1: 2 units' },
      { trueCount: 2, units: 4, description: 'TC +2: 4 units' },
      { trueCount: 3, units: 6, description: 'TC +3: 6 units' },
      { trueCount: 4, units: 8, description: 'TC ≥ +4: 8 units (max)' },
    ];
  }
  return [
    { trueCount: -99, units: 1, description: 'TC ≤ 0: Minimum (consider Wong out if very negative)' },
    { trueCount: 1, units: 2, description: 'TC +1: 2 units' },
    { trueCount: 2, units: 4, description: 'TC +2: 4 units' },
    { trueCount: 3, units: 6, description: 'TC +3: 6 units' },
    { trueCount: 4, units: 8, description: 'TC +4: 8 units' },
    { trueCount: 5, units: 12, description: 'TC ≥ +5: 12 units (max)' },
  ];
}

/**
 * Calculate Kelly criterion optimal bet
 * f* = edge / variance
 * For blackjack: variance ≈ 1.15, so bet ≈ edge / 1.15
 */
export function kellyBet(
  trueCount: number,
  rules: GameRules,
  bankroll: number,
  unitSize: number,
): number {
  const baseEdge = calculateBaseHouseEdge(rules);
  const playerEdge = (-baseEdge + (trueCount - 1) * 0.5) / 100;

  if (playerEdge <= 0) return unitSize; // minimum bet

  const variance = 1.15;
  const kellyFraction = playerEdge / variance;

  // Use fractional Kelly (typically half-Kelly for safety)
  const halfKelly = kellyFraction * 0.5;
  const optimalBet = Math.floor(bankroll * halfKelly);

  // Clamp between 1 unit and reasonable max
  return Math.max(unitSize, Math.min(optimalBet, unitSize * 16));
}
