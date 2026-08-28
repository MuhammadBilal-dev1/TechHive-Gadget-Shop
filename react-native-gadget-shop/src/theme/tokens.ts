/**
 * TechHive design tokens.
 * Drop this file at: react-native-gadget-shop/src/theme/tokens.ts
 *
 * Identity: "spec-sheet" tech aesthetic — graphite surfaces, an amber
 * signal accent for primary actions, cyan for secondary/info states,
 * and a monospace utility face for anything numeric (price, SKU, stock).
 */

export const colors = {
  graphiteInk: '#12141C',
  graphiteSurface: '#1E212D',
  graphiteSurfaceRaised: '#272B3A',
  paper: '#F6F5F2',
  ink: '#20222B',
  inkMuted: '#5B6170',
  border: '#2B2F3D',
  borderLight: '#E4E2DC',

  signalAmber: '#F2A93B',
  signalAmberDim: '#8A6423',
  circuitCyan: '#4FC1E9',
  success: '#3FCF8E',
  danger: '#E5484D',
  warning: '#F2A93B',

  white: '#FFFFFF',
  textOnDark: '#F1F1EF',
  textOnDarkMuted: '#9BA1AE',
} as const;

export const typography = {
  display: {
    fontFamily: 'SpaceGrotesk-Bold', // load via expo-font
    letterSpacing: -0.5,
  },
  body: {
    fontFamily: 'Inter-Regular',
  },
  bodyMedium: {
    fontFamily: 'Inter-Medium',
  },
  mono: {
    fontFamily: 'JetBrainsMono-Regular', // used for price/SKU/stock/order id
    letterSpacing: 0.2,
  },
  sizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 20,
    xl: 28,
    xxl: 36,
  },
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const radii = {
  sm: 6,
  md: 12,
  lg: 18,
  pill: 999,
} as const;

/** Status-LED colors used in the recurring "spec strip" motif. */
export const statusDot = {
  inStock: colors.success,
  lowStock: colors.signalAmber,
  outOfStock: colors.danger,
} as const;

export type StockStatus = keyof typeof statusDot;

export function getStockStatus(quantity: number): StockStatus {
  if (quantity <= 0) return 'outOfStock';
  if (quantity <= 5) return 'lowStock';
  return 'inStock';
}
