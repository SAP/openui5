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
    fileName: "themes/Tokenizer.css",
    content: ".ui5-hidden-text{clip:rect(1px,1px,1px,1px);font-size:0;left:-1000px;pointer-events:none;position:absolute;top:-1000px;user-select:none}:host{border:1px solid #000;box-sizing:border-box;display:inline-block;height:2.25rem}.ui5-tokenizer-root{align-items:center;box-sizing:border-box;display:flex;font-family:\"72override\",var(--sapFontFamily);height:100%;overflow-x:scroll}.ui5-tokenizer-no-padding{padding:0}.ui5-tokenizer-root.ui5-tokenizer-nmore--wrapper{overflow:hidden}.ui5-tokenizer--token--wrapper{align-items:center;box-sizing:border-box;display:inline-flex;height:100%}:host([expanded]) .ui5-tokenizer--content{display:inline-flex;overflow:hidden;white-space:nowrap}.ui5-tokenizer--content{align-items:center;box-sizing:border-box;display:flex;flex-wrap:nowrap;height:100%;overflow:hidden;padding-inline-start:var(--_ui5-v1-18-0_tokenizer_padding)}:host([_tokens-count=\"1\"]) .ui5-tokenizer--content{box-sizing:border-box;flex:1;max-width:100%;padding-inline-end:4px}.ui5-tokenizer-more-text{color:var(--_ui5-v1-18-0_tokenizer_n_more_text_color);cursor:pointer;display:inline-block;font-size:var(--sapFontSize);font-weight:400;margin-inline-start:.25rem;white-space:nowrap}"
  };
  var _default = styleData;
  _exports.default = _default;
});