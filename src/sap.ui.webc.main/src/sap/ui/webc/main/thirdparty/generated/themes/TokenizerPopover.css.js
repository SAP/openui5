sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Themes", "sap/ui/webc/common/thirdparty/theming/generated/themes/sap_fiori_3/parameters-bundle.css", "./sap_fiori_3/parameters-bundle.css"], function (_exports, _Themes, _parametersBundle, _parametersBundle2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _parametersBundle = _interopRequireDefault(_parametersBundle);
  _parametersBundle2 = _interopRequireDefault(_parametersBundle2);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  (0, _Themes.registerThemePropertiesLoader)("@ui5/webcomponents-theming", "sap_fiori_3", async () => _parametersBundle.default);
  (0, _Themes.registerThemePropertiesLoader)("@ui5/webcomponents", "sap_fiori_3", async () => _parametersBundle2.default);
  const styleData = {
    packageName: "@ui5/webcomponents",
    fileName: "themes/TokenizerPopover.css",
    content: "[ui5-responsive-popover]::part(content),[ui5-responsive-popover]::part(header){padding:0}#ui5-tokenizer-dialog-confirm-btn{height:100%;min-width:4rem}[ui5-responsive-popover]{margin-top:var(--_ui5-v1-18-0_tokenizer-popover_offset);margin-inline-start:calc(var(--_ui5-v1-18-0_tokenizer_padding)*-1)}"
  };
  var _default = styleData;
  _exports.default = _default;
});