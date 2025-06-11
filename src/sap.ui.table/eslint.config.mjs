import { defineConfig } from "eslint/config";

/*
 * Productive code and test code of sap.ui.table has been cleaned up.
 * No more references to the global jQuery allowed
 */
export default defineConfig([
  {
    name: "sap.ui.table",
    files: ["**/sap.ui.table/src/**/*.js", "**/sap.ui.table/test/**/*.js"],
    rules: {
      "no-var": "error",
      "one-var": ["error", { const: "never", let: "never" }],
      "one-var-declaration-per-line": ["error", "always"],
      "space-before-function-paren": [
        "error",
        {
          anonymous: "never",
          named: "never",
          asyncArrow: "always",
        },
      ],
      "space-before-blocks": "error",
      "space-in-parens": "error",
      "block-spacing": "error",
      "key-spacing": "error",
      "comma-spacing": "error",
      "comma-style": "error",
      "eol-last": ["error", "never"],
      //"padded-blocks": ["error", "never"],
      "array-bracket-spacing": "error",
      "no-multi-spaces": "error",
      "no-multiple-empty-lines": ["error", { max: 1 }],
      "no-whitespace-before-property": "error",
      "object-curly-newline": ["error", { consistent: true }],
      "object-curly-spacing": "error",
      eqeqeq: ["error", "always", { null: "ignore" }],
      "max-depth": ["warn", 4],
      "max-len": ["warn", 150],
      complexity: ["warn", { max: 12 }],
    },
  },
]);
