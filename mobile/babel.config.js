module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    // Reanimated 4 requires the Worklets babel plugin, and it MUST be listed last.
    plugins: ["react-native-worklets/plugin"],
  };
};
