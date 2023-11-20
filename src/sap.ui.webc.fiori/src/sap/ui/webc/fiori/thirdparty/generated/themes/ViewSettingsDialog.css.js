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
  (0, _Themes.registerThemePropertiesLoader)("@ui5/webcomponents-fiori", "sap_fiori_3", async () => _parametersBundle2.default);
  const styleData = {
    packageName: "@ui5/webcomponents-fiori",
    fileName: "themes/ViewSettingsDialog.css",
    content: "[on-desktop] .ui5-vsd-content{height:var(--_ui5-v1-18-0_vsd_content_height);min-width:350px}[on-desktop] [expand-content].ui5-vsd-content{height:var(--_ui5-v1-18-0_vsd_expand_content_height);min-width:350px}.ui5-vsd-header{padding-bottom:.25rem;width:100%}.ui5-vsd-content{margin:0 .1px 0 -1rem}.ui5-vsd-title{font-size:var(--sapFontHeader5Size)}.ui5-vsd-header-container{align-items:center;display:flex;height:var(--_ui5-v1-18-0_vsd_header_container);justify-content:space-between;line-height:var(--_ui5-v1-18-0_vsd_header_container)}.ui5-vsd-header-end{display:flex}.ui5-vsd-sub-header{height:var(--_ui5-v1-18-0_vsd_sub_header_container_height);line-height:var(--_ui5-v1-18-0_vsd_sub_header_container_height)}.ui5-vsd-header-start{align-items:center;display:flex}.ui5-vsd-back-button{margin-inline-end:.5rem}.ui5-vsd-footer{align-items:center;display:flex;justify-content:flex-end;margin:.1875rem 0;width:100%}.ui5-vsd-footer [ui5-button]:first-child{margin-inline-end:.5rem;min-width:4rem}.ui5-vsd-sort{height:100%;width:100%}[ui5-li-groupheader]{overflow:hidden}[ui5-dialog]::part(content){padding-bottom:0;padding-inline-end:0;padding-top:0}:host [ui5-li]::part(native-li){padding-inline-start:var(--_ui5-v1-18-0_vsd_content_li_padding)}:host [ui5-li].ui5-vsd-filterItemList::part(native-li){padding-inline-start:1rem}"
  };
  var _default = styleData;
  _exports.default = _default;
});