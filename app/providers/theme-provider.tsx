import React, {createContext, useContext} from 'react';
import {usePalette} from '@app/theme/theme';
type Ctx = {colors: ReturnType<typeof usePalette>};
const ThemeCtx = createContext<Ctx>({
  colors: {} as ReturnType<typeof usePalette>,
});
export function ThemeProvider({children}: {children: React.ReactNode}) {
  const colors = usePalette();
  return <ThemeCtx.Provider value={{colors}}>{children}</ThemeCtx.Provider>;
}
export const useTheme = () => useContext(ThemeCtx);
