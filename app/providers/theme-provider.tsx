import {usePalette} from '@app/theme/theme';
import type React from 'react';
import {createContext, useContext} from 'react';
type Ctx = {colors: ReturnType<typeof usePalette>};
const ThemeCtx = createContext<Ctx>({
  colors: {} as ReturnType<typeof usePalette>,
});
export function ThemeProvider({children}: {children: React.ReactNode}) {
  const colors = usePalette();
  return <ThemeCtx.Provider value={{colors}}>{children}</ThemeCtx.Provider>;
}
export const useTheme = () => useContext(ThemeCtx);
