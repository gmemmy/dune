export const spacing = {
  xs: 2,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 24,
  '3xl': 32,
};
export const radii = {sm: 4, md: 8, lg: 12, xl: 16, '2xl': 24};
export const typeScale = {
  xs: 10,
  sm: 12,
  md: 13,
  lg: 14,
  xl: 16,
  '2xl': 18,
  '3xl': 22,
};

export type Semantic =
  | 'bg'
  | 'surface'
  | 'overlay'
  | 'border'
  | 'text'
  | 'muted'
  | 'primary'
  | 'secondary'
  | 'critical'
  | 'accent';
export type Palette = Record<Semantic, string>;
