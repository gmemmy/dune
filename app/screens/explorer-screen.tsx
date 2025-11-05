import type {Entry} from '@app/ports/files';
import {useTheme} from '@app/providers/theme-provider';
import {useExplorerCtx} from '@app/providers/explorer-provider';
import {useExplorerHotkeys} from '@app/features/explorer/use-hotkeys';
import {Breadcrumbs} from '@app/ui/explorer/bread-crumbs';
import {ExplorerRow} from '@app/ui/explorer/explorer-row';
import {Toolbar} from '@app/ui/explorer/tool-bar';
import {List} from '@app/ui/list/list';
import * as React from 'react';
import {View, StyleSheet} from 'react-native';

export default function ExplorerScreen() {
  const {useSelector, actions} = useExplorerCtx();
  const cwd = useSelector((s) => s.cwd);
  const items = useSelector((s) => s.items);
  const selectedIndex = useSelector((s) => s.selectedIndex);
  const {colors} = useTheme();

  const styles = React.useMemo(
    () =>
      StyleSheet.create({
        container: {flex: 1},
        list: {flex: 1},
      }),
    [],
  );

  const themedStyles = React.useMemo(
    () =>
      StyleSheet.create({
        containerBg: {backgroundColor: colors.bg},
      }),
    [colors.bg],
  );

  useExplorerHotkeys(actions);

  React.useEffect(() => {
    if (__DEV__) {
      console.log(
        'FileCore host available?',
        !!(global as any).__FileCoreHostObject,
      );
    }
  }, []);

  return (
    <View style={[styles.container, themedStyles.containerBg]}>
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
        style={styles.list}
      />
    </View>
  );
}
