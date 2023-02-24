sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Themes", "sap/ui/webc/common/thirdparty/theming/generated/themes/sap_fiori_3/parameters-bundle.css", "./sap_fiori_3/parameters-bundle.css"], function (_exports, _Themes, _parametersBundle, _parametersBundle2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _parametersBundle = _interopRequireDefault(_parametersBundle);
  _parametersBundle2 = _interopRequireDefault(_parametersBundle2);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  (0, _Themes.registerThemePropertiesLoader)("@ui5/webcomponents-theming", "sap_fiori_3", () => _parametersBundle.default);
  (0, _Themes.registerThemePropertiesLoader)("@ui5/webcomponents", "sap_fiori_3", () => _parametersBundle2.default);
  var _default = {
    packageName: "@ui5/webcomponents",
    fileName: "themes/TabContainer.css",
    content: ":host(:not([hidden])){display:inline-block;width:100%}.ui5-tc-root{display:flex;flex-direction:column;width:100%;height:100%;font-family:\"72override\",var(--sapFontFamily);font-size:1rem}.ui5-tc__header{position:relative;padding:0 1rem;display:flex;align-items:center;height:var(--_ui5_tc_header_height);background-color:var(--sapObjectHeader_Background);box-shadow:var(--_ui5_tc_header_box_shadow);box-sizing:border-box}:host([tabs-placement=Bottom]) .ui5-tc__header{border-top:var(--_ui5_tc_header_border_bottom)}.ui5-tc-root.ui5-tc--textOnly .ui5-tc__header{height:var(--_ui5_tc_header_height_text_only)}.ui5-tc-root.ui5-tc--textOnly.ui5-tc--withAdditionalText.ui5-tc--standardTabLayout .ui5-tc__header{height:var(--_ui5_tc_header_height_text_with_additional_text)}.ui5-tc__tabStrip{flex:1;display:flex;overflow:hidden;box-sizing:border-box;position:relative;white-space:nowrap}.ui5-tc__separator:focus{outline:none}.ui5-tc__overflow{flex:0 0 0}.ui5-tc__overflow.ui5-tc__overflow--end{padding-inline-start:.188rem}.ui5-tc__overflow[hidden]{display:none}.ui5-tc__overflow>[ui5-button]{margin-top:.25rem;border-radius:.75rem;height:1.5rem}.ui5-tc__overflow>[ui5-button][focused]{outline-offset:.125rem}.ui5-tc-root.ui5-tc--textOnly .ui5-tc__content{height:calc(100% - var(--_ui5_tc_header_height_text_only))}.ui5-tc__content{position:relative;display:flex;height:calc(100% - var(--_ui5_tc_header_height));padding:1rem 2rem;background-color:var(--sapGroup_ContentBackground);border-bottom:var(--_ui5_tc_content_border_bottom);box-sizing:border-box}:host([tabs-placement=Bottom]) .ui5-tc__content{border-top:var(--_ui5_tc_content_border_bottom)}.ui5-tc__content--collapsed{display:none}.ui5-tc--transparent .ui5-tc__content{background-color:transparent}.ui5-tc__contentItem{max-height:100%;display:flex;flex-grow:1;overflow:auto}.ui5-tc__contentItem[hidden]{display:none}:host([media-range=S]) .ui5-tc__header{padding:0}:host([media-range=S]) .ui5-tc__content{padding:1rem}:host([media-range=XL]) .ui5-tc__header{padding:0 2rem}:host([media-range=XL]) .ui5-tc__content{padding:1rem 3rem}"
  };
  _exports.default = _default;
});