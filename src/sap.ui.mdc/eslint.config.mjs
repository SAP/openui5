import { defineConfig } from "eslint/config";

/*
 * Productive code, sample and unit test code of sap.ui.mdc has been cleaned up.
 * No more references to the global jQuery allowed
 */
export default defineConfig([
  {
    name: "sap.ui.mdc",
    files: [
      "**/sap.ui.mdc/src/**/*.js",
      "**/sap.ui.mdc/test/sap/ui/mdc/demokit/**/*.js",
      "**/sap.ui.mdc/test/sap/ui/mdc/integration/**/*.js",
      "**/sap.ui.mdc/test/sap/ui/mdc/qunit/**/*.js",
    ],
    rules: {
      "no-var": "error",
      "prefer-const": "error",
    },
  },
  {
    name: "sap.ui.mdc",
    files: ["**/sap.ui.mdc/src/**/*.js"],
    rules: {
      "function-call-argument-newline": ["warn", "consistent"],
      "object-property-newline": [
        "warn",
        { allowAllPropertiesOnSameLine: true },
      ],
      "array-element-newline": ["warn", "consistent"],
      "prefer-arrow-callback": "warn",
      "prefer-destructuring": "warn",
      "prefer-spread": "warn",
    },
  },
  {
    name: "sap.ui.mdc",
    files: [
      "**/sap.ui.mdc/src/sap/ui/mdc/Table.js",
      "**/sap.ui.mdc/src/sap/ui/mdc/TableDelegate.js",
      "**/sap.ui.mdc/src/sap/ui/mdc/odata/v4/TableDelegate.js",
      "**/sap.ui.mdc/src/sap/ui/mdc/table/**/*.js",
      "**/sap.ui.mdc/test/sap/ui/mdc/qunit/table/**/*.js",
    ],
    rules: {
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
      "array-bracket-spacing": "error",
      "no-multi-spaces": "error",
      "no-multiple-empty-lines": ["error", { max: 1 }],
      "no-whitespace-before-property": "error",
      "object-curly-newline": ["error", { consistent: true }],
      "object-curly-spacing": "error",
      eqeqeq: ["error", "always", { null: "ignore" }],
      "max-depth": ["error", 4],
      "max-len": ["error", 150],
      complexity: ["error", { max: 12 }],
    },
  },
]);
