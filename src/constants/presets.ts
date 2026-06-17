// Casino rule presets shown on the Settings screen.
import { GameRules } from '../types';

export interface Preset {
  name: string;
  group: string;
  rules: Partial<GameRules>;
}

// Keys to compare when matching presets against current rules
export const PRESET_KEYS: (keyof GameRules)[] = [
  'numDecks', 'dealerHitsSoft17', 'doubleAfterSplit', 'surrenderAvailable',
  'doubleOn', 'blackjackPays', 'dealerPeeks', 'originalBetsOnly',
  'charlieRule', 'bjAfterSplitPays', 'csm', 'penetration',
  'doubleAfterHit', 'maxSplitHands',
];

export function presetMatchesRules(preset: Partial<GameRules>, current: GameRules): boolean {
  for (const key of PRESET_KEYS) {
    if (key in preset && preset[key] !== current[key]) return false;
  }
  return true;
}

export const PRESETS: Preset[] = [
  // North America
  { name: 'Vegas Strip (Standard)', group: 'North America', rules: {
    numDecks: 6, dealerHitsSoft17: true, doubleAfterSplit: true,
    surrenderAvailable: 'late', doubleOn: 'any', blackjackPays: '3:2',
    dealerPeeks: true, originalBetsOnly: false, charlieRule: 'none',
    bjAfterSplitPays: '1:1', csm: false, penetration: 0.75,
    doubleAfterHit: false, maxSplitHands: 4,
  }},
  { name: 'Vegas Strip (6:5)', group: 'North America', rules: {
    numDecks: 6, dealerHitsSoft17: true, doubleAfterSplit: true,
    surrenderAvailable: 'none', doubleOn: 'any', blackjackPays: '6:5',
    dealerPeeks: true, originalBetsOnly: false, charlieRule: 'none',
    bjAfterSplitPays: '1:1', csm: false, penetration: 0.75,
    doubleAfterHit: false, maxSplitHands: 4,
  }},
  { name: 'Vegas Downtown', group: 'North America', rules: {
    numDecks: 2, dealerHitsSoft17: true, doubleAfterSplit: true,
    surrenderAvailable: 'none', doubleOn: 'any', blackjackPays: '3:2',
    dealerPeeks: true, originalBetsOnly: false, charlieRule: 'none',
    bjAfterSplitPays: '1:1', csm: false, penetration: 0.6,
    doubleAfterHit: false, maxSplitHands: 4,
  }},
  { name: 'Single Deck (6:5)', group: 'North America', rules: {
    numDecks: 1, dealerHitsSoft17: true, doubleAfterSplit: false,
    surrenderAvailable: 'none', doubleOn: 'any', blackjackPays: '6:5',
    dealerPeeks: true, originalBetsOnly: false, charlieRule: 'none',
    bjAfterSplitPays: '1:1', csm: false, penetration: 0.5,
    doubleAfterHit: false, maxSplitHands: 4,
  }},
  { name: 'Atlantic City', group: 'North America', rules: {
    numDecks: 8, dealerHitsSoft17: false, doubleAfterSplit: true,
    surrenderAvailable: 'late', doubleOn: 'any', blackjackPays: '3:2',
    dealerPeeks: true, originalBetsOnly: false, charlieRule: 'none',
    bjAfterSplitPays: '1:1', csm: false, penetration: 0.75,
    doubleAfterHit: false, maxSplitHands: 4,
  }},
  { name: 'Canadian Casino', group: 'North America', rules: {
    numDecks: 8, dealerHitsSoft17: false, doubleAfterSplit: true,
    surrenderAvailable: 'none', doubleOn: 'any', blackjackPays: '3:2',
    dealerPeeks: true, originalBetsOnly: false, charlieRule: 'none',
    bjAfterSplitPays: '1:1', csm: false, penetration: 0.75,
    doubleAfterHit: false, maxSplitHands: 4,
  }},
  // United Kingdom
  { name: 'UK Casino (Standard)', group: 'United Kingdom', rules: {
    numDecks: 6, dealerHitsSoft17: false, doubleAfterSplit: true,
    surrenderAvailable: 'none', doubleOn: 'any', blackjackPays: '3:2',
    dealerPeeks: false, originalBetsOnly: true, charlieRule: 'none',
    bjAfterSplitPays: '1:1', csm: false, penetration: 0.75,
    doubleAfterHit: false, maxSplitHands: 2,
  }},
  { name: 'UK Casino (5-Card Charlie)', group: 'United Kingdom', rules: {
    numDecks: 6, dealerHitsSoft17: false, doubleAfterSplit: true,
    surrenderAvailable: 'none', doubleOn: 'any', blackjackPays: '3:2',
    dealerPeeks: false, originalBetsOnly: true, charlieRule: '5',
    bjAfterSplitPays: '1:1', csm: false, penetration: 0.75,
    doubleAfterHit: false, maxSplitHands: 2,
  }},
  { name: 'Grosvenor Casinos', group: 'United Kingdom', rules: {
    numDecks: 6, dealerHitsSoft17: false, doubleAfterSplit: true,
    surrenderAvailable: 'none', doubleOn: 'any', blackjackPays: '3:2',
    dealerPeeks: false, originalBetsOnly: true, charlieRule: 'none',
    bjAfterSplitPays: '1:1', csm: false, penetration: 0.7,
    doubleAfterHit: false, maxSplitHands: 2,
  }},
  { name: 'Hippodrome London', group: 'United Kingdom', rules: {
    numDecks: 8, dealerHitsSoft17: false, doubleAfterSplit: true,
    surrenderAvailable: 'none', doubleOn: 'any', blackjackPays: '3:2',
    dealerPeeks: false, originalBetsOnly: true, charlieRule: 'none',
    bjAfterSplitPays: '1:1', csm: false, penetration: 0.75,
    doubleAfterHit: false, maxSplitHands: 2,
  }},
  // Europe
  { name: 'European ENHC (Standard)', group: 'Europe', rules: {
    numDecks: 6, dealerHitsSoft17: false, doubleAfterSplit: true,
    surrenderAvailable: 'none', doubleOn: 'any', blackjackPays: '3:2',
    dealerPeeks: false, originalBetsOnly: true, charlieRule: 'none',
    bjAfterSplitPays: '1:1', csm: false, penetration: 0.75,
    doubleAfterHit: false, maxSplitHands: 3,
  }},
  { name: 'Holland Casino', group: 'Europe', rules: {
    numDecks: 6, dealerHitsSoft17: false, doubleAfterSplit: true,
    surrenderAvailable: 'none', doubleOn: '9-11', blackjackPays: '3:2',
    dealerPeeks: false, originalBetsOnly: true, charlieRule: 'none',
    bjAfterSplitPays: '1:1', csm: false, penetration: 0.75,
    doubleAfterHit: false, maxSplitHands: 3,
  }},
  { name: 'German Casino', group: 'Europe', rules: {
    numDecks: 6, dealerHitsSoft17: false, doubleAfterSplit: false,
    surrenderAvailable: 'none', doubleOn: '9-11', blackjackPays: '3:2',
    dealerPeeks: false, originalBetsOnly: true, charlieRule: 'none',
    bjAfterSplitPays: '1:1', csm: false, penetration: 0.7,
    doubleAfterHit: false, maxSplitHands: 3,
  }},
  { name: 'French Casino', group: 'Europe', rules: {
    numDecks: 6, dealerHitsSoft17: false, doubleAfterSplit: true,
    surrenderAvailable: 'none', doubleOn: 'any', blackjackPays: '3:2',
    dealerPeeks: false, originalBetsOnly: true, charlieRule: 'none',
    bjAfterSplitPays: '1:1', csm: false, penetration: 0.75,
    doubleAfterHit: false, maxSplitHands: 2,
  }},
  { name: 'Spanish Casino', group: 'Europe', rules: {
    numDecks: 6, dealerHitsSoft17: false, doubleAfterSplit: true,
    surrenderAvailable: 'late', doubleOn: 'any', blackjackPays: '3:2',
    dealerPeeks: false, originalBetsOnly: true, charlieRule: 'none',
    bjAfterSplitPays: '1:1', csm: false, penetration: 0.75,
    doubleAfterHit: false, maxSplitHands: 3,
  }},
  { name: 'Czech / Eastern Europe', group: 'Europe', rules: {
    numDecks: 6, dealerHitsSoft17: false, doubleAfterSplit: true,
    surrenderAvailable: 'none', doubleOn: 'any', blackjackPays: '3:2',
    dealerPeeks: false, originalBetsOnly: true, charlieRule: 'none',
    bjAfterSplitPays: '1:1', csm: false, penetration: 0.7,
    doubleAfterHit: false, maxSplitHands: 4,
  }},
  // Asia-Pacific
  { name: 'Macau (Standard)', group: 'Asia-Pacific', rules: {
    numDecks: 8, dealerHitsSoft17: false, doubleAfterSplit: true,
    surrenderAvailable: 'late', doubleOn: 'any', blackjackPays: '3:2',
    dealerPeeks: false, originalBetsOnly: true, charlieRule: 'none',
    bjAfterSplitPays: '1:1', csm: false, penetration: 0.75,
    doubleAfterHit: false, maxSplitHands: 3,
  }},
  { name: 'Crown Melbourne', group: 'Asia-Pacific', rules: {
    numDecks: 8, dealerHitsSoft17: false, doubleAfterSplit: true,
    surrenderAvailable: 'none', doubleOn: 'any', blackjackPays: '3:2',
    dealerPeeks: false, originalBetsOnly: true, charlieRule: 'none',
    bjAfterSplitPays: '1:1', csm: false, penetration: 0.75,
    doubleAfterHit: false, maxSplitHands: 3,
  }},
  { name: 'Marina Bay Sands', group: 'Asia-Pacific', rules: {
    numDecks: 8, dealerHitsSoft17: false, doubleAfterSplit: true,
    surrenderAvailable: 'late', doubleOn: 'any', blackjackPays: '3:2',
    dealerPeeks: false, originalBetsOnly: true, charlieRule: 'none',
    bjAfterSplitPays: '1:1', csm: false, penetration: 0.7,
    doubleAfterHit: false, maxSplitHands: 3,
  }},
  // Special
  { name: 'Best Possible Rules', group: 'Special', rules: {
    numDecks: 1, dealerHitsSoft17: false, doubleAfterSplit: true,
    surrenderAvailable: 'early', doubleOn: 'any', blackjackPays: '3:2',
    dealerPeeks: true, originalBetsOnly: false, charlieRule: '5',
    bjAfterSplitPays: '3:2', csm: false, resplitAces: true,
    hitSplitAces: true, penetration: 0.85, doubleAfterHit: true,
    maxSplitHands: 4,
  }},
  { name: 'Worst Common Rules', group: 'Special', rules: {
    numDecks: 8, dealerHitsSoft17: true, doubleAfterSplit: false,
    surrenderAvailable: 'none', doubleOn: '10-11', blackjackPays: '6:5',
    dealerPeeks: false, originalBetsOnly: false, charlieRule: 'none',
    bjAfterSplitPays: '1:1', csm: false, resplitAces: false,
    hitSplitAces: false, penetration: 0.5, doubleAfterHit: false,
    maxSplitHands: 2,
  }},
  { name: 'Online Casino (Typical)', group: 'Special', rules: {
    numDecks: 8, dealerHitsSoft17: false, doubleAfterSplit: true,
    surrenderAvailable: 'none', doubleOn: 'any', blackjackPays: '3:2',
    dealerPeeks: true, originalBetsOnly: false, charlieRule: 'none',
    bjAfterSplitPays: '1:1', csm: false, penetration: 0.5,
    doubleAfterHit: false, maxSplitHands: 4,
  }},
];

export const PRESET_GROUPS = ['North America', 'United Kingdom', 'Europe', 'Asia-Pacific', 'Special'];
