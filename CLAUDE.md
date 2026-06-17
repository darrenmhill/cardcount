# CardCount — Blackjack Card Counting Companion

## Quick Start

```bash
npm install
npx expo start --web     # Web
npx expo start --ios     # iOS
npx expo start --android # Android
```

## Stack

- **Expo SDK 54** with expo-router (file-based routing)
- **React Native** 0.81 + TypeScript
- **Zustand** for state management
- **AsyncStorage** for settings persistence

## Architecture

```
app/                    # expo-router screens — thin route wrappers only
  _layout.tsx           # Tab navigator with 5 tabs
  index.tsx             # Count tracker (main screen)
  strategy.tsx          # Basic strategy matrices
  deviations.tsx        # Index plays / deviations
  other.tsx             # Tools tab (wraps src/features/ToolsScreen)
  settings.tsx          # Game rules & counting system config

src/
  engine/               # Pure logic (no React) — unit tested in __tests__/
    countingSystems.ts  # 9 counting systems, TC conversion, house edge
    basicStrategy.ts    # Full basic strategy matrix generation
    deviations.ts       # Illustrious 18, Fab 4, additional deviations
    betting.ts          # Bet spread, Kelly criterion
    bankroll.ts         # Risk of ruin, bet ramp, variance simulation
    training.ts         # Drill question generators, performance stats
  features/             # Shared screen content (Tools tab internals)
    ToolsScreen.tsx     # Betting/Train/Sessions/Bankroll/Stats/Variance tabs
    BettingContent.tsx  # Bet spread recommendations
    TrainContent.tsx    # Training drills (speed, strategy, deviation, TC)
  components/           # Small shared UI (Tooltip, ConfirmModal, etc.)
  store/
    useStore.ts         # Zustand store (count tracking, rules, persistence)
    sessions.ts         # Session log + drill result persistence
  types/
    index.ts            # All TypeScript types
  constants/
    theme.ts            # Colors, spacing, font sizes (dark theme)
    presets.ts          # Casino rule presets for the Settings screen
```

## Key Gotchas

- For unbalanced systems (KO, Red 7) the store's `trueCount` IS the running
  count. TC-calibrated math (bet sizing, edge) must go through
  `estimateTrueCount()` in `src/engine/countingSystems.ts`, and deviation
  thresholds through `getEffectiveIndex()`, which accounts for the per-deck
  RC imbalance (+4/deck KO, +2/deck Red 7).
- `updateRules` only resets the shoe when `numDecks` changes; other rule
  edits preserve the live count.

## Counting Systems Implemented

Hi-Lo, Hi-Opt I, Hi-Opt II, Omega II, Zen Count, Wong Halves, KO (Knockout), Red 7, Ace-Five

## Key Commands

```bash
npm test                # Jest engine tests (src/engine/__tests__)
npm run lint            # ESLint (eslint-config-expo, no-explicit-any = error)
npx tsc --noEmit        # Type check
npx expo export --platform web  # Production web build
```
