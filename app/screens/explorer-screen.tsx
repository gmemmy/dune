import * as React from 'react';
import {View, NativeModules} from 'react-native';
import {useExplorer} from '@app/state/explorer';
import type {Entry} from '@app/ports/files';
import {List} from '@app/ui/list/list';
import {ExplorerRow} from '@app/ui/explorer/explorer-row';
import {Toolbar} from '@app/ui/explorer/tool-bar';
import {Breadcrumbs} from '@app/ui/explorer/bread-crumbs';
import {useTheme} from '@app/providers/theme-provider';

declare const window: any;
export default function ExplorerScreen() {
  const cwd = useExplorer((s) => s.cwd);
  const items = useExplorer((s) => s.items);
  const selectedIndex = useExplorer((s) => s.selectedIndex);
  const actions = useExplorer((s) => s.actions);
  const {colors} = useTheme();

  React.useEffect(() => {
    useExplorer.getState().actions.init();
  }, []);

  React.useEffect(() => {
    const h = (e: any) => {
      const actions = useExplorer.getState().actions;
      if (e.metaKey || e.ctrlKey || e.altKey) {
        return;
      }
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

    window?.addEventListener?.('keydown', h);
    return () => {
      window?.removeEventListener?.('keydown', h);
    };
  }, []);

  React.useEffect(() => {
    // Debug native vs mock
    // eslint-disable-next-line no-console
    console.log('FileCore host available?', !!(global as any).__FileCoreHostObject);
  }, []);

  React.useEffect(() => {
    type FileCoreInstallerModule = { install: () => void } | undefined;
    const installerModule = (NativeModules as unknown as {
      FileCoreInstaller?: FileCoreInstallerModule;
    }).FileCoreInstaller;
    if (installerModule && typeof installerModule.install === 'function') {
      try {
        installerModule.install();
      } catch {}
    }
  }, []);

  return (
    <View style={{flex: 1, backgroundColor: colors.bg}}>
      <Toolbar
        cwd={cwd}
        count={items.length}
        onEnterPath={(t) => actions.go(t)}
      />
      <Breadcrumbs path={cwd} />
      <List<Entry>
        data={items}
        keyExtractor={(it) => it.path}
        heightForItem={() => 28}
        onEndReached={() => actions.loadMore()}
        renderItem={({item, index}) => (
          <ExplorerRow item={item} selected={index === selectedIndex} />
        )}
        style={{flex: 1}}
      />
    </View>
  );
}
