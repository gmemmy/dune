import * as React from 'react';

type Actions = {
  moveSelection: (delta: number) => void;
  openSelected: () => Promise<void>;
  up: () => Promise<void>;
};

export function useExplorerHotkeys(actions: Actions) {
  React.useEffect(() => {
    const h = (e: any) => {
      if (e.metaKey || e.ctrlKey || e.altKey) {
        return;
      };
      switch (e.key) {
        case 'ArrowDown':
          actions.moveSelection(1);
          e.preventDefault();
          break;
        case 'ArrowUp':
          actions.moveSelection(-1);
          e.preventDefault();
          break;
        case 'Enter':
          actions.openSelected();
          e.preventDefault();
          break;
        case 'Backspace':
          actions.up();
          e.preventDefault();
          break;
        default:
          break;
      }
    };
    (globalThis as unknown as any)?.addEventListener?.('keydown', h);
    return () => (globalThis as any)?.removeEventListener?.('keydown', h);
  }, [actions]);
}
