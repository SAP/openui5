/** @type {import("stylelint").Config} */
export default {
  extends: ["stylelint-config-standard"],
  plugins: ["@stylistic/stylelint-plugin"],
  "defaultSeverity": "warning",
  rules: {
    "alpha-value-notation": "number",
    "at-rule-no-unknown": null,
    "at-rule-empty-line-before": [ "always",
      {
        "ignoreAtRules": ["import", "/^_sap_/", "/^_sap/"]
      }
    ],
    "comment-empty-line-before": null,
    "color-function-alias-notation": null,
    "color-function-notation": null,
    "color-hex-length": null,
    "declaration-property-value-no-unknown": null,
    "declaration-block-no-redundant-longhand-properties": [ true,
      {
        "ignoreShorthands": ["inset", "/flex/", "overflow", "border", "background"]
      }
    ],
    "font-family-name-quotes": null,
    "font-family-no-missing-generic-family-keyword": null,
    "keyframes-name-pattern": null,
    "keyframe-selector-notation": "keyword",
    "length-zero-no-unit": true,
    "import-notation": null,
    "max-nesting-depth": [ 4,
      {
        "message": "Please check for overly specific selector."
      },
      { disableFix: true }
    ],
    "media-feature-range-notation": null,
    "media-query-no-invalid": null,
    "selector-max-compound-selectors": [ 4,
      {
        "message": "Please check for overly specific selector."
      },
      { disableFix: true }
    ],
    "no-descending-specificity": null,
    "selector-class-pattern": null,
    "custom-property-pattern": null,
    "property-no-vendor-prefix": [ true,
      {
        "ignoreProperties": ["-webkit-user-select", "-webkit-text-size-adjust", "-webkit-appearance", "/^-placeholder/"]
      }
    ],
    "property-no-deprecated": null,
    "at-rule-disallowed-list": ["-webkit-keyframes"],
    "rule-empty-line-before": ["always",
      {
        "ignore": ["after-comment"]
      }
    ],
    "selector-not-notation": "simple",
    "selector-attribute-quotes": "always",
    "shorthand-property-no-redundant-values": null,
    "value-keyword-case": [ "lower",
      {
        "ignoreKeywords": ["currentColor"]
      }
    ],
    "@stylistic/indentation": ["tab"],
    "@stylistic/declaration-colon-space-after": "always",
    "@stylistic/string-quotes": "single",
    "@stylistic/no-eol-whitespace": true,
    "@stylistic/block-opening-brace-space-before": "always",
    "@stylistic/selector-combinator-space-after": "before",
    "@stylistic/selector-combinator-space-after": "always",
    "@stylistic/declaration-bang-space-before": "always",
  },
  overrides: [
    {files: ["**/*.less"], customSyntax: "postcss-less"}
  ]
};
