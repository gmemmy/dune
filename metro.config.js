const path = require('path');
const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const defaultConfig = getDefaultConfig(__dirname);
defaultConfig.resolver = defaultConfig.resolver || {};
defaultConfig.resolver.platforms = Array.from(
  new Set([...(defaultConfig.resolver.platforms || []), 'macos'])
);

const config = {
  resolver: {
    extraNodeModules: {
      '@app': path.resolve(__dirname, 'app'),
    },
  },
};

module.exports = mergeConfig(defaultConfig, config);
