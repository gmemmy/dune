import {useMemo} from 'react';
import {Appearance} from 'react-native';
import {light} from './palette.light';
import {dark} from './palette.dark';

export function usePalette() {
  const scheme = Appearance.getColorScheme() ?? 'dark';
  return useMemo(() => (scheme === 'dark' ? dark : light), [scheme]);
}
