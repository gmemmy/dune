import * as React from 'react';
import {LegendList} from '@legendapp/list';
import {ViewStyle, StyleProp} from 'react-native';

type Props<T> = {
  data: T[];
  heightForItem: (item: T, index: number) => number;
  renderItem: (args: {item: T; index: number}) => React.ReactNode;
  onEndReached?: () => void;
  keyExtractor: (item: T, index: number) => string;
  style?: StyleProp<ViewStyle>;
};

export function List<T>(p: Props<T>) {
  const Component = LegendList<T>;
  return (
    <Component
      data={p.data}
      estimatedItemSize={28}
      maintainVisibleContentPosition={true}
      onEndReached={p.onEndReached}
      renderItem={({item, index}: {item: T; index: number}) =>
        p.renderItem({item, index})
      }
      keyExtractor={p.keyExtractor}
      style={p.style}
    />
  );
}
