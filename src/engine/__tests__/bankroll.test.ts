import { riskOfRuinContinuous, recommendedBankroll } from '../bankroll';
import { GameRules } from '../../types';

const RULES: GameRules = {
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

describe('riskOfRuinContinuous', () => {
  it('returns 1 (certain ruin) with no edge', () => {
    expect(riskOfRuinContinuous(1000, 0, 4)).toBe(1);
    expect(riskOfRuinContinuous(1000, -0.01, 4)).toBe(1);
  });

  it('falls in (0,1] for a positive edge', () => {
    const ror = riskOfRuinContinuous(400, 0.01, 4);
    expect(ror).toBeGreaterThan(0);
    expect(ror).toBeLessThanOrEqual(1);
  });

  it('rises as the average bet grows (more aggressive ramp = more risk)', () => {
    const small = riskOfRuinContinuous(400, 0.01, 2);
    const big = riskOfRuinContinuous(400, 0.01, 8);
    expect(big).toBeGreaterThan(small);
  });

  it('falls as the bankroll grows', () => {
    const lean = riskOfRuinContinuous(200, 0.01, 4);
    const deep = riskOfRuinContinuous(800, 0.01, 4);
    expect(deep).toBeLessThan(lean);
  });
});

describe('recommendedBankroll', () => {
  it('requires more bankroll for a wider max-bet spread', () => {
    const narrow = recommendedBankroll(RULES, 4).units;
    const wide = recommendedBankroll(RULES, 12).units;
    expect(wide).toBeGreaterThan(narrow);
  });

  it('requires more bankroll for a lower target risk of ruin', () => {
    const lenient = recommendedBankroll(RULES, 12, 0.1).units;
    const strict = recommendedBankroll(RULES, 12, 0.01).units;
    expect(strict).toBeGreaterThan(lenient);
  });
});
