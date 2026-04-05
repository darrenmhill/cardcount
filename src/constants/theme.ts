export const Colors = {
  // Backgrounds: deep charcoal-green (casino felt undertone)
  background: '#0b0f0d',
  surface: '#151a17',
  surfaceLight: '#1c2420',
  card: '#212b26',
  cardElevated: '#2a3630',

  // Primary: antique gold (chips, VIP, table trim)
  primary: '#c9a84c',
  primaryDim: '#7a6530',

  // Secondary: deep burgundy
  secondary: '#9b4d5a',

  // Accent: champagne gold for highlights
  accent: '#e8d5a3',

  // Semantic
  success: '#4ade80',
  danger: '#f87171',
  warning: '#fbbf24',

  // Text: warm ivory tones
  text: '#ede8df',
  textSecondary: '#a09882',
  textDim: '#6b6355',

  // Strategy actions (distinct but harmonized)
  hit: '#5b9bd5',        // steel blue
  stand: '#d4605a',      // muted red
  double: '#5dba72',     // casino green
  split: '#9b7ec8',      // soft purple
  surrender: '#d4a843',  // gold-amber

  // Borders
  border: '#2e3a34',

  // Count indicators
  positive: '#4ade80',
  negative: '#f87171',
  neutral: '#a09882',
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const FontSize = {
  xs: 10,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

// Font families — loaded via expo-font in _layout.tsx
export const Fonts = {
  body: 'Inter_400Regular',
  bodyMedium: 'Inter_500Medium',
  bodySemiBold: 'Inter_600SemiBold',
  bodyBold: 'Inter_700Bold',
  mono: 'JetBrainsMono_400Regular',
  monoMedium: 'JetBrainsMono_500Medium',
  monoBold: 'JetBrainsMono_700Bold',
  monoLight: 'JetBrainsMono_300Light',
} as const;
