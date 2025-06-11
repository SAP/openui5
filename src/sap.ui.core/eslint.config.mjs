import globals from "globals";
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    name: "sap.ui.core",
    ignores: [
      "**/sap.ui.core/src/sap/ui/model/base/**/*.js",
      "**/sap.ui.core/src/sap/ui/model/odata/v4/**/*.js",
    ],
    files: [
      "**/sap.ui.core/src/sap/ui/core/fieldhelp/**/*.js",
      "**/sap.ui.core/src/sap/ui/model/**/*.js",
      "**/sap.ui.core/test/sap/ui/core/qunit/fieldhelp/**/*.js",
    ],
    rules: {
      "max-len": ["error", { code: 120, ignoreUrls: true }],
    },
  },
  {
    name: "sap.ui.core",
    files: [
      "**/sap.ui.core/src/sap/ui/base/SyncPromise.js",
      "**/sap.ui.core/src/sap/ui/core/util/XMLPreprocessor.js",
      "**/sap.ui.core/src/sap/ui/model/odata/v4/**/*.js",
      "**/sap.ui.core/src/sap/ui/test/TestUtils.js",
      "**/sap.ui.core/test/sap/ui/core/demokit/sample/common/**/*.js",
      "**/sap.ui.core/test/sap/ui/core/demokit/sample/odata/v4/**/*.js",
      "**/sap.ui.core/test/sap/ui/core/demokit/sample/ViewTemplate/**/*.js",
      "**/sap.ui.core/test/sap/ui/core/demokit/tutorial/odatav4/**/*.js",
      "**/sap.ui.core/test/sap/ui/core/qunit/odata/v4/**/*.js",
      "**/sap.ui.core/test/sap/ui/core/qunit/util/SyncPromise.qunit.js",
      "**/sap.ui.core/test/sap/ui/core/qunit/util/XMLPreprocessor.qunit.js",
      "**/sap.ui.core/test/sap/ui/test/qunit/TestUtils.qunit.js",
    ],
    rules: {
      "consistent-return": "off", // override "warn"
      "max-len": [
        "error",
        {
          code: 100,
          ignorePattern: "@param|@returns|&lt;",
          ignoreUrls: true,
        },
      ],
      "no-inner-declarations": ["error", "both"],
      "no-mixed-spaces-and-tabs": "error", // override "smart-tabs"
      "no-unused-vars": ["error", { argsIgnorePattern: "^_", args: "all", caughtErrors: "none" }],

      // stylistic (JIRA: CPOUI5ODATAV4-1325)
      // {"multiline": true} doesn't match our style
      "array-bracket-newline": ["error", "consistent"],
      "array-bracket-spacing": "error",
      "block-scoped-var": "error", // override "warn"
      "block-spacing": "error",
      camelcase: "error", // override "warn"
      "class-methods-use-this": "error",
      "comma-spacing": "error",
      "comma-style": ["error", "last"],
      "computed-property-spacing": "error",
      "eol-last": "error",
      eqeqeq: "error",
      "implicit-arrow-linebreak": "error", // let's see...
      "jsx-quotes": "error", // let's see...
      "key-spacing": ["error", { beforeColon: true }],
      "lines-between-class-members": "error",
      "logical-assignment-operators": [
        "error",
        "always",
        {
          enforceForIfStatements: true,
        },
      ],
      "max-classes-per-file": "error",
      "new-cap": "error", // override "warn"
      "no-await-in-loop": "error",
      "no-else-return": "error",
      "no-lonely-if": "error", // override "warn"
      "no-multiple-empty-lines": ["error", { max: 1 }],
      "no-multi-spaces": "error",
      "no-new": "error", // override "warn"
      "no-redeclare": "error", // override "warn"
      "no-shadow": "error",
      "no-tabs": ["error", { allowIndentationTabs: true }],
      "no-unneeded-ternary": ["error", { defaultAssignment: false }],
      "no-unused-expressions": "error", // override "warn"
      "no-use-before-define": "error", // override "warn"
      "no-whitespace-before-property": "error",
      "nonblock-statement-body-position": "error", // @see "curly": ["error", "all"]
      // "multiline" doesn't match our style
      "object-curly-newline": ["error", { consistent: true }],
      "object-curly-spacing": "error",
      "one-var": ["error", { const: "never", let: "never", var: "always" }],
      "one-var-declaration-per-line": ["error", "initializations"],
      "operator-assignment": "error",
      "operator-linebreak": ["error", "before"],
      "padded-blocks": ["error", "never"],
      "padding-line-between-statements": [
        "error",
        { blankLine: "always", prev: "var", next: "*" },
        // {"blankLine": "always", "prev": "*", "next": "return"} // still in discussion
      ],
      "quote-props": ["error", "as-needed", { numbers: true }],
      quotes: ["error", "double", { avoidEscape: true }],
      "semi-spacing": "error", // override "warn"
      "sort-imports": "error",
      "space-before-blocks": "error",
      "space-before-function-paren": ["error", { named: "never" }],
      "space-in-parens": "error",
      "switch-colon-spacing": "error",
      "template-curly-spacing": "error",

      // "array-element-newline": "off", // "consistent" doesn't match our style
      // "capitalized-comments": "off", // cannot treat line & block comments differently
      // "function-call-argument-newline": "off", // "consistent" doesn't match our style
      // "function-paren-newline": "off", // "consistent" doesn't match our style
      // "multiline-comment-style": "off", // we use both, line & block comments...
      // "multiline-ternary": "off", // "always-multiline" doesn't match our style
      // "newline-per-chained-call": "off", // doesn't match our style
      // "prefer-exponentiation-operator": "off", // requires ES2016
      // "prefer-object-spread": "off", // requires ES2018
      // "sort-vars": "off", // cannot deal with Hungarian prefix :-(
      // "wrap-regex": "off", // not useful
    },
  },
  {
    name: "sap.ui.core",
    files: [
      "**/sap.ui.core/src/sap/ui/base/SyncPromise.js",
      "**/sap.ui.core/src/sap/ui/core/util/XMLPreprocessor.js",
      "**/sap.ui.core/src/sap/ui/model/odata/v4/**/*.js",
    ],
    rules: {
      "max-statements-per-line": "error",
    },
  },
  {
    name: "sap.ui.core",
    files: [
      "**/sap.ui.core/test/sap/ui/core/demokit/sample/common/**/*.js",
      "**/sap.ui.core/test/sap/ui/core/demokit/sample/odata/v4/**/*.js",
      "**/sap.ui.core/test/sap/ui/core/demokit/sample/ViewTemplate/**/*.js",
      "**/sap.ui.core/test/sap/ui/core/demokit/tutorial/odatav4/??/webapp/test/**/*.js",
      "**/sap.ui.core/test/sap/ui/core/qunit/odata/v4/**/*.js",
      "**/sap.ui.core/test/sap/ui/core/qunit/util/SyncPromise.qunit.js",
      "**/sap.ui.core/test/sap/ui/core/qunit/util/XMLPreprocessor.qunit.js",
    ],
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: "script",
      globals: {
        ...globals.qunit,
        sinon: "readonly",
      },
    },
    rules: {
      "array-callback-return": ["error", { checkForEach: true }],
      camelcase: "off",
      "max-nested-callbacks": "off",
      "no-warning-comments": "off",
    },
  },
  {
    name: "sap.ui.core",
    files: [
      "**/sap.ui.core/test/sap/ui/core/demokit/sample/odata/v4/**/Opa*.qunit.js",
      "**/sap.ui.core/test/sap/ui/core/demokit/sample/ViewTemplate/*/Opa.qunit.js",
    ],
    rules: {
      // Opa does not work without these imports
      "no-unused-vars": [
        "error",
        { argsIgnorePattern: "Any|Main", args: "all" },
      ],
    },
  },
  {
    name: "sap.ui.core",
    files: ["**/sap.ui.core/test/sap/ui/core/demokit/sample/odata/v4/**/SandboxModel.js"],
    rules: {
      "max-len": "off",
    },
  },
  {
    name: "sap.ui.core",
    files: ["**/sap.ui.core/test/sap/ui/core/demokit/tutorial/odatav4/**"],
    rules: {
      "no-inner-declarations": ["error", "functions"],
    },
  },
]);
