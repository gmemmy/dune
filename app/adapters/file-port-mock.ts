import type {FilePort, Entry, ListPage} from '@app/ports/files';
const MOCK: Entry[] = Array.from({length: 6000}, (_, i) => ({
  name: i % 7 === 0 ? `Folder_${i}` : `File_${i}.txt`,
  path: `/mock/${i % 7 === 0 ? `Folder_${i}` : `File_${i}.txt`}`,
  kind: i % 7 === 0 ? 'dir' : 'file',
  size: i % 7 === 0 ? undefined : 512 + i * 13,
  mtime: Date.now() - i * 1000 * 60,
  hidden: i % 23 === 0,
}));
export const FilePortMock: FilePort = {
  async list(_dir, {limit = 300, cursor} = {}): Promise<ListPage> {
    const start = cursor ? Number(cursor) : 0;
    const items = MOCK.slice(start, start + limit);
    const next =
      start + limit < MOCK.length ? String(start + limit) : undefined;
    return {items, cursor: next};
  },
  async statMultiple(
    paths: string[],
  ): Promise<Array<{path: string; size: number; lastModified: number}>> {
    return paths.map((p) => ({
      path: p,
      size: Math.floor(Math.random() * 1e6),
      lastModified: Date.now(),
    }));
  },
};
