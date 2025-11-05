import {create} from 'zustand';
import type {Entry, FilePort} from '@app/ports/files';
import {FilePortMock} from '@app/adapters/file-port-mock';
import {FilePortNative} from '@app/adapters/file-port-native';

type State = {
  cwd: string;
  items: Entry[];
  cursor?: string;
  loading: boolean;
  selectedIndex: number;
  port: FilePort;
  actions: {
    init: () => Promise<void>;
    setPort: (p: FilePort) => void;
    go: (dir: string) => Promise<void>;
    openSelected: () => Promise<void>;
    up: () => Promise<void>;
    loadMore: () => Promise<void>;
    moveSelection: (delta: number) => void;
  };
};

/**
 * State for the explorer screen
 * @see ExplorerScreen
 */
function getHomeFromPath(path: string): string | undefined {
  const m = path.match(/^\/Users\/[^/]+/);
  return m ? m[0] : undefined;
}

function normalizePath(currentDir: string, input: string): string {
  const trimmed = input.trim();
  if (trimmed.length === 0) {return currentDir;}
  const home = getHomeFromPath(currentDir) ?? '/Users';
  const expandTilde = (p: string) => (p.startsWith('~') ? home + p.slice(1) : p);
  let target = expandTilde(trimmed);
  if (!target.startsWith('/')) {
    // Relative
    target = `${currentDir.replace(/\/$/, '')}/${target}`;
  }
  // Convenience: map top-level common folders to user's home
  if (target === '/Desktop') {target = `${home}/Desktop`;}
  if (target === '/Documents') {target = `${home}/Documents`;}
  if (target === '/Downloads') {target = `${home}/Downloads`;}
  // Collapse duplicate slashes
  target = target.replace(/\/+/g, '/');
  return target;
}

export const useExplorer = create<State>((set, get) => ({
  cwd: (global as unknown as {__FileCoreHostObject: boolean})?.__FileCoreHostObject ? '/Users/sensei' : '/mock',
  items: [],
  cursor: undefined,
  loading: false,
  selectedIndex: 0,
  port: (global as unknown as {__FileCoreHostObject: boolean})?.__FileCoreHostObject ? FilePortNative : FilePortMock,
  actions: {
    async init() {
      // If native host becomes available after boot, switch port once
      const hasNative = !!(global as any).__FileCoreHostObject;
      if (hasNative) {
        set({port: FilePortNative});
      }
      const startDir = hasNative ? '/' : '/mock';
      await get().actions.go(startDir);
    },
    setPort(port) {
      set({port});
    },
    async go(dir) {
      const {port} = get();
      const current = get().cwd;
      const targetDir = normalizePath(current, dir);
      set({
        cwd: targetDir,
        loading: true,
        items: [],
        cursor: undefined,
        selectedIndex: 0,
      });
      const page = await port.list(targetDir, {limit: 100});
      set({items: page.items, cursor: page.cursor, loading: false});
    },
    async loadMore() {
      const {loading, cursor, cwd, items, port} = get();
      if (loading || !cursor) {
        return;
      }
      set({loading: true});
      const page = await port.list(cwd, {limit: 400, cursor});
      set({
        items: items.concat(page.items),
        cursor: page.cursor,
        loading: false,
      });
    },
    moveSelection(delta) {
      const {selectedIndex, items} = get();
      const next = Math.max(
        0,
        Math.min(items.length - 1, selectedIndex + delta),
      );
      set({selectedIndex: next});
    },
    async openSelected() {
      const {items, selectedIndex, actions} = get();
      const row = items[selectedIndex];
      if (row?.kind === 'dir') {
        await actions.go(row.path);
      }
    },
    async up() {
      const {cwd, actions} = get();
      const parent = cwd.includes('/')
        ? cwd.replace(/\/[^/]+$/, '') || '/'
        : cwd;
      await actions.go(parent);
    },
  },
}));
