import {FilePortMock} from '@app/adapters/file-port-mock';
import type {Entry, FilePort, ListPage} from '@app/ports/files';

declare global {
  // eslint-disable-next-line no-var
  var __FileCoreHostObject:
    | {
        listAsJSArray: (
          dir: string,
          limit: number,
          cursor?: string,
        ) => {items: Entry[]; cursor?: string};
        statMultipleAsJS: (
          paths: string[],
        ) => Array<{path: string; size: number; lastModified: number}>;
      }
    | undefined;
}

function getHost() {
  return global.__FileCoreHostObject;
}

export const FilePortNative: FilePort = {
  async list(
    dir,
    {limit = 300, cursor}: {limit?: number; cursor?: string} = {},
  ): Promise<ListPage> {
    const host = getHost();
    if (!host) {
      console.warn('[FilePortNative] host not available, using mock');
      // Fallback to mock until native host is installed
      return FilePortMock.list(dir, {limit, cursor});
    }
    try {
      const res = host.listAsJSArray(dir, limit, cursor);
      return {items: res.items, cursor: res.cursor};
    } catch (e) {
      console.warn('[FilePortNative] list fallback due to error:', e);
      // Graceful fallback on any native error
      return FilePortMock.list(dir, {limit, cursor});
    }
  },

  async statMultiple(
    paths: string[],
  ): Promise<Array<{path: string; size: number; lastModified: number}>> {
    const host = getHost();
    if (!host) {
      console.warn(
        '[FilePortNative] host not available, statMultiple using mock',
      );
      return FilePortMock.statMultiple(paths);
    }
    try {
      return host.statMultipleAsJS(paths);
    } catch {
      console.warn('[FilePortNative] statMultiple fallback due to error');
      return FilePortMock.statMultiple(paths);
    }
  },
};
