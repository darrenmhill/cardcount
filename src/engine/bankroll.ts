import { GameRules } from '../types';
import { calculateBaseHouseEdge } from './countingSystems';

/**
 * Calculate Risk of Ruin using the standard approximation:
 * RoR = ((1 - edge/sd) / (1 + edge/sd))^(bankroll/unit)
 * where edge and sd are in units per hand
 */
export function riskOfRuin(
  bankrollUnits: number,
  edgePercent: number,
  sdPerHand: number = 1.15,
): number {
  if (edgePercent <= 0) return 1; // no edge = certain ruin eventually
  const edge = edgePercent / 100;
  const ratio = edge / sdPerHand;
  const base = (1 - ratio) / (1 + ratio);
  return Math.pow(base, bankrollUnits);
}

/**
 * Continuous (exponential) approximation of lifetime Risk of Ruin:
 *   RoR = exp(−2 · bankroll · edge / (avgBet · sd²))
 * Bankroll and avgBet are in betting units; `edgeFraction` is the per-hand
 * win-rate as a fraction (0.01 = +1%). Unlike the flat-bet `riskOfRuin`,
 * this scales with the average bet, so a more aggressive ramp (larger
 * average bet) correctly raises the risk and a bigger bankroll lowers it.
 */
export function riskOfRuinContinuous(
  bankrollUnits: number,
  edgeFraction: number,
  avgBetUnits: number,
  sd: number = 1.15,
): number {
  if (edgeFraction <= 0 || avgBetUnits <= 0) return 1;
  const exponent = (-2 * bankrollUnits * edgeFraction) / (avgBetUnits * sd * sd);
  return Math.min(1, Math.exp(exponent));
}

/**
 * Calculate recommended minimum bankroll for a given spread and rules.
 * Solves the continuous RoR formula for bankroll at the target risk, scaling
 * with the spread's max bet (a wider spread → larger average bet → more
 * bankroll required).
 */
export function recommendedBankroll(
  rules: GameRules,
  maxBetUnits: number,
  targetRoR: number = 0.05, // 5% risk of ruin
): { units: number; description: string } {
  const baseEdge = calculateBaseHouseEdge(rules);
  // Representative edge while betting big (assume avg TC of +2).
  const avgEdge = Math.max(0.1, -baseEdge + 2 * 0.5) / 100;
  const sd = 1.15;

  // The average bet across a 1→maxBet ramp sits well below the max because
  // high counts are infrequent; ~40% of max is a reasonable approximation.
  const avgBetUnits = Math.max(1, maxBetUnits * 0.4);

  // RoR = exp(−2·B·edge / (avgBet·sd²))  ⇒  B = −ln(RoR)·avgBet·sd² / (2·edge)
  const bankrollUnits = Math.ceil(
    (-Math.log(targetRoR) * avgBetUnits * sd * sd) / (2 * avgEdge),
  );

  return {
    units: bankrollUnits,
    description: `${bankrollUnits} units for ${(targetRoR * 100).toFixed(0)}% risk of ruin at a ${maxBetUnits}x max bet`,
  };
}

/**
 * Calculate optimal bet ramp using Kelly criterion
 * Returns recommended bet at each true count
 */
export function optimalBetRamp(
  rules: GameRules,
  bankrollUnits: number,
  kellyFraction: number = 0.5, // half-Kelly default
): { tc: number; units: number; edge: number }[] {
  const baseEdge = calculateBaseHouseEdge(rules);
  const variance = 1.15;
  const ramp: { tc: number; units: number; edge: number }[] = [];

  for (let tc = -5; tc <= 10; tc++) {
    const playerEdge = (-baseEdge + tc * 0.5) / 100;
    let betUnits: number;
    if (playerEdge <= 0) {
      betUnits = 1;
    } else {
      const kelly = playerEdge / (variance * variance);
      betUnits = Math.max(1, Math.round(bankrollUnits * kelly * kellyFraction));
    }
    ramp.push({ tc, units: betUnits, edge: playerEdge * 100 });
  }

  return ramp;
}

/**
 * Generate variance simulation data points for a fan chart.
 * Returns percentile bands (5th, 25th, 50th, 75th, 95th) over N hands.
 */
export function varianceSimulation(
  avgEdgePercent: number,
  avgBetUnits: number,
  numHands: number,
  numPoints: number = 50,
): { hand: number; p5: number; p25: number; p50: number; p75: number; p95: number }[] {
  const edge = avgEdgePercent / 100;
  const sd = 1.15; // standard deviation per hand in units
  const points: { hand: number; p5: number; p25: number; p50: number; p75: number; p95: number }[] = [];

  for (let i = 0; i <= numPoints; i++) {
    const hand = Math.round((i / numPoints) * numHands);
    if (hand === 0) {
      points.push({ hand: 0, p5: 0, p25: 0, p50: 0, p75: 0, p95: 0 });
      continue;
    }

    const ev = edge * avgBetUnits * hand;
    const totalSD = sd * avgBetUnits * Math.sqrt(hand);

    // Normal distribution percentiles
    points.push({
      hand,
      p5:  ev - 1.645 * totalSD,
      p25: ev - 0.674 * totalSD,
      p50: ev,
      p75: ev + 0.674 * totalSD,
      p95: ev + 1.645 * totalSD,
    });
  }

  return points;
}

/**
 * Expected hourly value
 */
export function hourlyEV(
  edgePercent: number,
  avgBetSize: number,
  handsPerHour: number = 80,
): number {
  return (edgePercent / 100) * avgBetSize * handsPerHour;
}
