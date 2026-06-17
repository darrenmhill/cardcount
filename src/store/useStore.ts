import { create } from 'zustand';
import { Card, CountingSystemId, GameRules } from '../types';
import { COUNTING_SYSTEMS, calculateTrueCount, getDecksRemaining, getInitialRunningCount } from '../engine/countingSystems';
import { Storage } from './storage';

interface DealtCard {
  card: Card;
  value: number; // actual count value used (may differ from system default for Red 7 overrides)
}

interface CardCountState {
  // Current counting system
  systemId: CountingSystemId;
  setSystem: (id: CountingSystemId) => void;

  // Game rules
  rules: GameRules;
  updateRules: (partial: Partial<GameRules>) => void;

  // Count tracking
  runningCount: number;
  cardsDealt: number;
  acesDealt: number; // for side-counting systems
  shoeHistory: DealtCard[]; // cards dealt this shoe

  // Derived values
  trueCount: number;
  decksRemaining: number;

  // Actions
  dealCard: (card: Card, countOverride?: number) => void;
  undoLastCard: () => void;
  resetShoe: () => void;

  // Persistence
  loadSettings: () => Promise<void>;
  saveSettings: () => Promise<void>;
}

// Deck counts the house-edge model and presets support; anything else is rejected on load.
const VALID_DECK_COUNTS: GameRules['numDecks'][] = [1, 2, 4, 6, 8];

const DEFAULT_RULES: GameRules = {
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

export const useStore = create<CardCountState>((set, get) => ({
  systemId: 'hi-lo',
  rules: DEFAULT_RULES,
  runningCount: 0,
  cardsDealt: 0,
  acesDealt: 0,
  shoeHistory: [],
  trueCount: 0,
  decksRemaining: DEFAULT_RULES.numDecks,

  setSystem: (id) => {
    const state = get();
    const initialRC = getInitialRunningCount(id, state.rules.numDecks);
    set({
      systemId: id,
      runningCount: initialRC,
      cardsDealt: 0,
      acesDealt: 0,
      shoeHistory: [],
      trueCount: 0,
      decksRemaining: state.rules.numDecks,
    });
    get().saveSettings();
  },

  updateRules: (partial) => {
    const state = get();
    const newRules = { ...state.rules, ...partial };
    // Only a deck-count change invalidates the running count;
    // other rule tweaks (payouts, surrender, penetration…) keep the shoe intact.
    if (newRules.numDecks !== state.rules.numDecks) {
      const initialRC = getInitialRunningCount(state.systemId, newRules.numDecks);
      set({
        rules: newRules,
        runningCount: initialRC,
        cardsDealt: 0,
        acesDealt: 0,
        shoeHistory: [],
        trueCount: 0,
        decksRemaining: newRules.numDecks,
      });
    } else {
      set({ rules: newRules });
    }
    get().saveSettings();
  },

  dealCard: (card, countOverride) => {
    const state = get();
    const system = COUNTING_SYSTEMS[state.systemId];
    const value = countOverride !== undefined ? countOverride : system.values[card];
    const newRC = state.runningCount + value;
    const newCardsDealt = state.cardsDealt + 1;
    const totalCards = state.rules.numDecks * 52;
    const newDecksRemaining = getDecksRemaining(totalCards, newCardsDealt);
    const newTC = calculateTrueCount(newRC, newDecksRemaining, system);
    const newAcesDealt = card === 'A' ? state.acesDealt + 1 : state.acesDealt;

    set({
      runningCount: newRC,
      cardsDealt: newCardsDealt,
      acesDealt: newAcesDealt,
      shoeHistory: [...state.shoeHistory, { card, value }],
      trueCount: Math.round(newTC * 10) / 10, // round to 1 decimal
      decksRemaining: Math.round(newDecksRemaining * 100) / 100,
    });
  },

  undoLastCard: () => {
    const state = get();
    if (state.shoeHistory.length === 0) return;

    const lastEntry = state.shoeHistory[state.shoeHistory.length - 1];
    const system = COUNTING_SYSTEMS[state.systemId];
    const value = lastEntry.value;
    const newRC = state.runningCount - value;
    const newCardsDealt = state.cardsDealt - 1;
    const totalCards = state.rules.numDecks * 52;
    const newDecksRemaining = getDecksRemaining(totalCards, newCardsDealt);
    const newTC = newCardsDealt === 0 ? 0 : calculateTrueCount(newRC, newDecksRemaining, system);
    const newAcesDealt = lastEntry.card === 'A' ? state.acesDealt - 1 : state.acesDealt;

    set({
      runningCount: newRC,
      cardsDealt: newCardsDealt,
      acesDealt: newAcesDealt,
      shoeHistory: state.shoeHistory.slice(0, -1),
      trueCount: Math.round(newTC * 10) / 10,
      decksRemaining: Math.round(newDecksRemaining * 100) / 100,
    });
  },

  resetShoe: () => {
    const state = get();
    const initialRC = getInitialRunningCount(state.systemId, state.rules.numDecks);
    set({
      runningCount: initialRC,
      cardsDealt: 0,
      acesDealt: 0,
      shoeHistory: [],
      trueCount: 0,
      decksRemaining: state.rules.numDecks,
    });
  },

  loadSettings: async () => {
    try {
      const data = await Storage.get();
      if (data) {
        const parsed = JSON.parse(data);
        // Validate persisted values — corrupt/tampered storage must never crash
        // the app (an unknown systemId would make COUNTING_SYSTEMS[id] undefined).
        const loadedSystem: CountingSystemId =
          parsed.systemId && COUNTING_SYSTEMS[parsed.systemId as CountingSystemId]
            ? parsed.systemId
            : 'hi-lo';
        const loadedRules = { ...DEFAULT_RULES, ...parsed.rules };
        if (!VALID_DECK_COUNTS.includes(loadedRules.numDecks)) {
          loadedRules.numDecks = DEFAULT_RULES.numDecks;
        }
        const initialRC = getInitialRunningCount(loadedSystem, loadedRules.numDecks);
        set({
          systemId: loadedSystem,
          rules: loadedRules,
          runningCount: initialRC,
          cardsDealt: 0,
          acesDealt: 0,
          shoeHistory: [],
          trueCount: 0,
          decksRemaining: loadedRules.numDecks,
        });
      }
    } catch {
      // Use defaults
    }
  },

  saveSettings: async () => {
    const state = get();
    try {
      await Storage.set(JSON.stringify({
        systemId: state.systemId,
        rules: state.rules,
      }));
    } catch {
      // Ignore
    }
  },
}));
