import type {Entry} from '@app/ports/files';
import {useTheme} from '@app/providers/theme-provider';
import React from 'react';
import {Text, View} from 'react-native';
export function ExplorerRow({
  item,
  selected,
}: {
  item: Entry;
  selected: boolean;
}) {
  const {colors} = useTheme();
  return (
    <View
      style={{
        height: 28,
        paddingHorizontal: 12,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: selected ? colors.overlay : 'transparent',
      }}
    >
      <Text style={{width: 22}}>{item.kind === 'dir' ? '📁' : '📄'}</Text>
      <Text numberOfLines={1} style={{flex: 1, color: colors.text}}>
        {item.name}
      </Text>
      {item.size != null && (
        <Text style={{width: 100, textAlign: 'right', color: colors.muted}}>
          {item.size}
        </Text>
      )}
    </View>
  );
}
