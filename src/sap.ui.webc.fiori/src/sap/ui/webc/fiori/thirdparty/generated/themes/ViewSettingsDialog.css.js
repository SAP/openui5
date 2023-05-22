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
    content: "[on-desktop] .ui5-vsd-content {\n\theight: var(--_ui5_vsd_content_height);\n\tmin-width: 350px;\n}\n\n[on-desktop] [expand-content].ui5-vsd-content {\n\theight: var(--_ui5_vsd_expand_content_height);\n\tmin-width: 350px;\n}\n\n.ui5-vsd-header {\n\twidth: 100%;\n\tpadding-bottom: 0.25rem;\n}\n\n.ui5-vsd-content {\n\tmargin: 0 0.1px 0 -1rem;\n}\n\n.ui5-vsd-title {\n\tfont-size: var(--sapFontHeader5Size);\n}\n\n.ui5-vsd-header-container {\n\tdisplay: flex;\n\talign-items: center;\n\tjustify-content: space-between;\n\theight: var(--_ui5_vsd_header_container);\n\tline-height: var(--_ui5_vsd_header_container);\n}\n\n.ui5-vsd-header-end {\n\tdisplay: flex;\n}\n\n.ui5-vsd-sub-header {\n\theight: var(--_ui5_vsd_sub_header_container_height);\n\tline-height: var(--_ui5_vsd_sub_header_container_height);\n}\n\n.ui5-vsd-header-start {\n\tdisplay: flex;\n\talign-items: center;\n}\n\n.ui5-vsd-back-button {\n\tmargin-inline-end: .5rem;\n}\n\n.ui5-vsd-footer {\n\twidth: 100%;\n\tdisplay: flex;\n\tjustify-content: flex-end;\n\tmargin: 0.1875rem 0;\n}\n\n.ui5-vsd-footer [ui5-button]:first-child {\n\tmargin-right: 0.5rem;\n\tmin-width: 4rem;\n}\n\n.ui5-vsd-sort {\n\twidth: 100%;\n\theight: 100%;\n}\n\n[ui5-li-groupheader] {\n\toverflow: hidden;\n}\n\n[ui5-dialog]::part(content) {\n\tpadding-top: 0;\n\tpadding-bottom: 0;\n\tpadding-right: 0;\n}\n\n:host [ui5-li]::part(native-li) {\n\tpadding-inline-start: var(--_ui5_vsd_content_li_padding);\n}\n\n:host [ui5-li].ui5-vsd-filterItemList::part(native-li) {\n\tpadding-inline-start: 1rem;\n}"
  };
  var _default = styleData;
  _exports.default = _default;
});