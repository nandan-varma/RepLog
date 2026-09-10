// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require("eslint-config-expo/flat");

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ["dist/*"],
  },
  {
    rules: {
      // New in this eslint-config-expo version. Flags the standard
      // client-hydration-flag pattern in use-color-scheme.web.ts
      // (setHasHydrated(true) in an empty-deps effect); not a real bug.
      "react-hooks/set-state-in-effect": "off",
    },
  },
]);
