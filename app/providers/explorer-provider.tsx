import {useExplorer} from '@app/state/explorer';
import * as React from 'react';

const ExplorerCtx = React.createContext({useSelector: useExplorer, actions: useExplorer.getState().actions});

export function ExplorerProvider({children}: React.PropsWithChildren) {
  const actions = React.useMemo(() => useExplorer.getState().actions, []);

  React.useEffect(() => {
    actions.init();
  }, [actions]);

  return (
    <ExplorerCtx.Provider value={{useSelector: useExplorer, actions}}>
      {children}
    </ExplorerCtx.Provider>
  );
}
export const useExplorerCtx = () => React.useContext(ExplorerCtx);
