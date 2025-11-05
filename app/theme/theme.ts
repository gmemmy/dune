import {useMemo} from 'react';
import {Appearance} from 'react-native';
import {dark} from './palette.dark';
import {light} from './palette.light';

export function usePalette() {
  const scheme = Appearance.getColorScheme() ?? 'dark';
  return useMemo(() => (scheme === 'dark' ? dark : light), [scheme]);
}
