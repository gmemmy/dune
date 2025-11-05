export type Entry = {
  name: string;
  path: string;
  kind: 'file' | 'dir';
  size?: number;
  lastModified?: number;
  hidden?: boolean;
};
export type ListPage = {items: Entry[]; cursor?: string};
export interface FilePort {
  list(
    dir: string,
    opts?: {limit?: number; cursor?: string},
  ): Promise<ListPage>;
  statMultiple(
    paths: string[],
  ): Promise<Array<{path: string; size: number; lastModified: number}>>;
}
