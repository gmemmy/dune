import {AppProvider} from '@app/providers/app-provider';
import ExplorerScreen from '@app/screens/explorer-screen';
import React from 'react';
import {View} from 'react-native';

export default function App() {
  return (
    <AppProvider>
      <View style={{flex: 1}}>
        <ExplorerScreen />
      </View>
    </AppProvider>
  );
}
