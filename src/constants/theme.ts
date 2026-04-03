export const Colors = {
  background: '#0a0e17',
  surface: '#141b2d',
  surfaceLight: '#1a2340',
  card: '#1e293b',
  cardElevated: '#243049',

  primary: '#22d3ee',     // cyan
  primaryDim: '#0e7490',
  secondary: '#a78bfa',   // purple
  accent: '#f59e0b',      // amber

  success: '#10b981',
  danger: '#ef4444',
  warning: '#f59e0b',

  text: '#f1f5f9',
  textSecondary: '#94a3b8',
  textDim: '#64748b',

  hit: '#3b82f6',        // blue
  stand: '#ef4444',      // red
  double: '#22c55e',     // green
  split: '#a855f7',      // purple
  surrender: '#f59e0b',  // amber

  border: '#334155',

  positive: '#10b981',   // green for +count
  negative: '#ef4444',   // red for -count
  neutral: '#94a3b8',
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
