import type * as React from 'react';

import {ThemeProvider} from './theme-provider';
import {ExplorerProvider} from './explorer-provider';
export function AppProvider({children}: {children: React.ReactNode}) {
  return (
    <ThemeProvider>
      <ExplorerProvider>{children}</ExplorerProvider>
    </ThemeProvider>
  );
}
