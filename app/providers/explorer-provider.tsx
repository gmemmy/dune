import * as React from 'react';
import {useExplorer} from '@app/state/explorer';

const ExplorerCtx = React.createContext({useSelector: useExplorer});

export function ExplorerProvider({children}: React.PropsWithChildren) {
  return (
    <ExplorerCtx.Provider value={{useSelector: useExplorer}}>
      {children}
    </ExplorerCtx.Provider>
  );
}
export const useExplorerCtx = () => React.useContext(ExplorerCtx);
