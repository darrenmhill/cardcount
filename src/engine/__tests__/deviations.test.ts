import {
  ILLUSTRIOUS_18,
  FAB_4,
  getActiveDeviations,
  getEffectiveIndex,
  getDeviation,
} from '../deviations';
import { DeviationPlay } from '../../types';

const insurance = ILLUSTRIOUS_18.find(d => d.name === 'Insurance') as DeviationPlay;
const sixteenVsTen = ILLUSTRIOUS_18.find(d => d.name === '16 vs 10: Stand') as DeviationPlay;
const thirteenVsTwo = ILLUSTRIOUS_18.find(d => d.name === '13 vs 2: Hit') as DeviationPlay;

describe('Illustrious 18 / Fab 4 data', () => {
  test('contains the full published sets', () => {
    expect(ILLUSTRIOUS_18).toHaveLength(18);
    expect(FAB_4).toHaveLength(4);
  });
});

describe('getEffectiveIndex — balanced systems', () => {
  test('Hi-Lo uses the canonical index', () => {
    expect(getEffectiveIndex(insurance, 'hi-lo', 6, 3)).toBe(3);
  });

  test('system-specific published overrides win', () => {
    // Zen insurance index is +5 (Snyder)
    expect(getEffectiveIndex(insurance, 'zen', 6, 3)).toBe(5);
  });
});

describe('getEffectiveIndex — unbalanced RC thresholds', () => {
  // For KO the conversion must account for the +4/deck imbalance:
  //   RC_threshold = 4 + (TC_index − 4) × decks_remaining
  test('KO 6-deck insurance (TC +3) thresholds by depth', () => {
    expect(getEffectiveIndex(insurance, 'ko', 6, 6)).toBe(-2); // fresh shoe
    expect(getEffectiveIndex(insurance, 'ko', 6, 3)).toBe(1);  // half shoe
    expect(getEffectiveIndex(insurance, 'ko', 6, 1)).toBe(3);  // last deck
  });

  test('KO threshold for a TC +4 play sits at the pivot (+4) at any depth', () => {
    const tcFourPlay = ILLUSTRIOUS_18.find(d => d.name === '15 vs 10: Stand') as DeviationPlay;
    expect(tcFourPlay.index).toBe(4);
    for (const decksRemaining of [6, 4, 2, 1]) {
      expect(getEffectiveIndex(tcFourPlay, 'ko', 6, decksRemaining)).toBe(4);
    }
  });

  test('Red 7 threshold for a TC +2 play sits at the pivot (0) at any depth', () => {
    const tcTwoPlay = ILLUSTRIOUS_18.find(d => d.name === '12 vs 3: Stand') as DeviationPlay;
    expect(tcTwoPlay.index).toBe(2);
    for (const decksRemaining of [6, 3, 1]) {
      expect(getEffectiveIndex(tcTwoPlay, 'red-7', 6, decksRemaining)).toBe(0);
    }
  });
});

describe('getActiveDeviations', () => {
  test('Hi-Lo: 16v10 active at TC 0, insurance only from TC +3', () => {
    const atZero = getActiveDeviations(0, true, 'hi-lo', 6, 6);
    expect(atZero.map(d => d.name)).toContain('16 vs 10: Stand');
    expect(atZero.map(d => d.name)).not.toContain('Insurance');

    const atThree = getActiveDeviations(3, true, 'hi-lo', 6, 6);
    expect(atThree.map(d => d.name)).toContain('Insurance');
  });

  test('Hi-Lo: negative-count plays activate at or below their index', () => {
    const names = getActiveDeviations(-1, true, 'hi-lo', 6, 6).map(d => d.name);
    expect(names).toContain('13 vs 2: Hit');   // index −1, direction <=
    expect(names).toContain('12 vs 4: Hit');   // index 0, direction <=
    expect(names).not.toContain('12 vs 5: Hit'); // index −2
  });

  test('surrender plays are excluded when surrender is unavailable', () => {
    const names = getActiveDeviations(10, false, 'hi-lo', 6, 6).map(d => d.name);
    expect(names.filter(n => n.includes('Surrender'))).toHaveLength(0);
  });

  test('Ace-Five yields no deviations', () => {
    expect(getActiveDeviations(10, true, 'ace-five', 6, 6)).toHaveLength(0);
  });

  test('KO fresh shoe at IRC has no positive deviations active', () => {
    // RC −20 on a fresh 6-deck shoe is a neutral count; with the old broken
    // conversion (threshold −11 for insurance) this incorrectly activated.
    const names = getActiveDeviations(-20, true, 'ko', 6, 6).map(d => d.name);
    expect(names).not.toContain('Insurance');
    expect(names).not.toContain('15 vs 10: Stand');
  });
});

describe('getDeviation lookup', () => {
  test('finds the active play for a specific hand', () => {
    const dev = getDeviation('16', '10', 0, true, 'hi-lo', 6, 6);
    expect(dev?.name).toBe('16 vs 10: Stand');
  });

  test('returns null when the count does not trigger it', () => {
    expect(getDeviation('15', '10', 3, true, 'hi-lo', 6, 6)).toBeNull();
  });

  test('13 vs 2 hit triggers via thirteenVsTwo index', () => {
    const dev = getDeviation('13', '2', thirteenVsTwo.index, true, 'hi-lo', 6, 6);
    expect(dev?.name).toBe('13 vs 2: Hit');
  });

  test('16 vs 10 uses sixteenVsTen direction (>= 0)', () => {
    expect(sixteenVsTen.direction).toBe('>=');
    expect(getDeviation('16', '10', -1, true, 'hi-lo', 6, 6)).toBeNull();
  });
});
