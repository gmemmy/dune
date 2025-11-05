import type * as React from 'react';

import {ExplorerProvider} from './explorer-provider';
import {ThemeProvider} from './theme-provider';
export function AppProvider({children}: {children: React.ReactNode}) {
  return (
    <ThemeProvider>
      <ExplorerProvider>{children}</ExplorerProvider>
    </ThemeProvider>
  );
}
