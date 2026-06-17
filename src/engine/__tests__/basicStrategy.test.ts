import { generateBasicStrategy, DEALER_CARDS } from '../basicStrategy';
import { GameRules } from '../../types';

// Expected cells follow the standard published multi-deck charts
// (e.g. Wizard of Odds basic strategy, 4–8 decks).

const RULES_6D_H17: GameRules = {
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

const RULES_6D_S17: GameRules = { ...RULES_6D_H17, dealerHitsSoft17: false };

describe('hard totals — 6 deck H17 DAS LS', () => {
  const { hard } = generateBasicStrategy(RULES_6D_H17);

  test('always-stand and always-hit rows', () => {
    for (const dc of DEALER_CARDS) {
      expect(hard['20'][dc]).toBe('S');
      expect(hard['5'][dc]).toBe('H');
      expect(hard['8'][dc]).toBe('H');
    }
  });

  test('hard 16: stand vs 2–6, hit vs 7–8, surrender vs 9/10/A', () => {
    expect(hard['16']['6']).toBe('S');
    expect(hard['16']['7']).toBe('H');
    expect(hard['16']['9']).toBe('Rh');
    expect(hard['16']['10']).toBe('Rh');
    expect(hard['16']['A']).toBe('Rh');
  });

  test('hard 15 vs A surrenders only under H17', () => {
    expect(hard['15']['A']).toBe('Rh');
    const s17 = generateBasicStrategy(RULES_6D_S17).hard;
    expect(s17['15']['A']).toBe('H');
  });

  test('hard 17 vs A surrenders only under H17', () => {
    expect(hard['17']['A']).toBe('Rs');
    const s17 = generateBasicStrategy(RULES_6D_S17).hard;
    expect(s17['17']['A']).toBe('S');
  });

  test('hard 12: hit vs 2-3, stand vs 4-6', () => {
    expect(hard['12']['2']).toBe('H');
    expect(hard['12']['3']).toBe('H');
    expect(hard['12']['4']).toBe('S');
    expect(hard['12']['6']).toBe('S');
    expect(hard['12']['7']).toBe('H');
  });

  test('hard 11 doubles vs everything (multi-deck)', () => {
    for (const dc of DEALER_CARDS) {
      expect(hard['11'][dc]).toBe('Dh');
    }
  });

  test('hard 9: hit vs 2 in 6 decks, double vs 3-6', () => {
    expect(hard['9']['2']).toBe('H');
    expect(hard['9']['3']).toBe('Dh');
    expect(hard['9']['6']).toBe('Dh');
    expect(hard['9']['7']).toBe('H');
  });

  test('double restrictions disable doubles', () => {
    const restricted = generateBasicStrategy({ ...RULES_6D_H17, doubleOn: '10-11' }).hard;
    expect(restricted['9']['5']).toBe('H');
    expect(restricted['11']['6']).toBe('Dh');
  });
});

describe('soft totals — H17 vs S17', () => {
  const h17 = generateBasicStrategy(RULES_6D_H17).soft;
  const s17 = generateBasicStrategy(RULES_6D_S17).soft;

  test('A7 vs 2: double under H17, stand under S17', () => {
    expect(h17['A7']['2']).toBe('Ds');
    expect(s17['A7']['2']).toBe('S');
  });

  test('A8 vs 6: double under H17 only', () => {
    expect(h17['A8']['6']).toBe('Ds');
    expect(s17['A8']['6']).toBe('S');
  });

  test('A7 core cells', () => {
    expect(h17['A7']['6']).toBe('Ds');
    expect(h17['A7']['7']).toBe('S');
    expect(h17['A7']['9']).toBe('H');
    expect(h17['A7']['A']).toBe('H');
  });

  test('A2–A5 double vs 5-6, hit otherwise', () => {
    for (const row of ['A2', 'A3', 'A4', 'A5']) {
      expect(h17[row]['5']).toBe('Dh');
      expect(h17[row]['6']).toBe('Dh');
      expect(h17[row]['2']).toBe('H');
      expect(h17[row]['10']).toBe('H');
    }
  });
});

describe('pairs — 6 deck H17 DAS LS', () => {
  const { pair } = generateBasicStrategy(RULES_6D_H17);

  test('always split aces and eights (88 surrenders vs 10/A with LS)', () => {
    for (const dc of DEALER_CARDS) {
      expect(pair['AA'][dc]).toBe('P');
    }
    expect(pair['88']['9']).toBe('P');
    expect(pair['88']['10']).toBe('Rp');
    expect(pair['88']['A']).toBe('Rp');
  });

  test('never split tens or fives', () => {
    for (const dc of DEALER_CARDS) {
      expect(pair['TT'][dc]).toBe('S');
      expect(pair['55'][dc]).not.toBe('P');
    }
  });

  test('99: split except vs 7, 10, A', () => {
    expect(pair['99']['6']).toBe('P');
    expect(pair['99']['7']).toBe('S');
    expect(pair['99']['9']).toBe('P');
    expect(pair['99']['10']).toBe('S');
  });

  test('22/33 vs 2-3 split only with DAS', () => {
    expect(pair['22']['2']).toBe('P');
    const noDas = generateBasicStrategy({ ...RULES_6D_H17, doubleAfterSplit: false }).pair;
    expect(noDas['22']['2']).toBe('H');
    expect(noDas['33']['3']).toBe('H');
    expect(noDas['33']['4']).toBe('P');
  });
});
