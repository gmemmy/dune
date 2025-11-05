import {useTheme} from '@app/providers/theme-provider';
import * as React from 'react';
import {Text, View} from 'react-native';

export function Breadcrumbs({path}: {path: string}) {
  const {colors} = useTheme();
  const parts = path.split('/').filter(Boolean);
  return (
    <View
      style={{
        flexDirection: 'row',
        paddingHorizontal: 8,
        gap: 6,
        height: 24,
        alignItems: 'center',
      }}
    >
      <Text style={{color: colors.muted}}>/</Text>
      {parts.map((p, i) => (
        <Text key={p} style={{color: colors.muted}}>
          {p}
          {i < parts.length - 1 ? ' /' : ''}
        </Text>
      ))}
    </View>
  );
}
