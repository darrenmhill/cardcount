// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require("eslint-config-expo/flat");
const tsPlugin = require("@typescript-eslint/eslint-plugin");

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ["dist/*", "ios/*", ".expo/*", "server.js"],
  },
  {
    // Register the plugin in the same object as the rule so plain `eslint`
    // (not just `expo lint`) can resolve "@typescript-eslint/*".
    plugins: { "@typescript-eslint": tsPlugin },
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
    },
  },
]);
