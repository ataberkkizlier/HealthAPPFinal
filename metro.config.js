/**
 * Metro configuration for React Native
 * https://facebook.github.io/metro/docs/configuration
 *
 * @format
 */
const { getDefaultConfig } = require("@expo/metro-config");

const defaultConfig = getDefaultConfig(__dirname);

// Add any custom configurations here
defaultConfig.resolver.sourceExts = [...defaultConfig.resolver.sourceExts, 'jsx', 'js', 'ts', 'tsx', 'json'];

// Ensure proper resolution of modules
defaultConfig.resolver.extraNodeModules = {
  ...defaultConfig.resolver.extraNodeModules,
  'services': `${__dirname}/services`,
  'firebase': `${__dirname}/firebase`,
};

module.exports = defaultConfig;

