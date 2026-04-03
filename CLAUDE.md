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
app/                    # expo-router screens (tabs)
  _layout.tsx           # Tab navigator with 5 tabs
  index.tsx             # Count tracker (main screen)
  strategy.tsx          # Basic strategy matrices
  deviations.tsx        # Index plays / deviations
  betting.tsx           # Bet spread recommendations
  settings.tsx          # Game rules & counting system config

src/
  engine/               # Pure logic (no React)
    countingSystems.ts  # 9 counting systems with card values
    basicStrategy.ts    # Full basic strategy matrix generation
    deviations.ts       # Illustrious 18, Fab 4, additional deviations
    betting.ts          # Bet spread, Kelly criterion
  store/
    useStore.ts         # Zustand store (count tracking, rules, persistence)
  types/
    index.ts            # All TypeScript types
  constants/
    theme.ts            # Colors, spacing, font sizes (dark theme)
```

## Counting Systems Implemented

Hi-Lo, Hi-Opt I, Hi-Opt II, Omega II, Zen Count, Wong Halves, KO (Knockout), Red 7, Ace-Five

## Key Commands

```bash
npx tsc --noEmit        # Type check
npx expo export --platform web  # Production web build
```
