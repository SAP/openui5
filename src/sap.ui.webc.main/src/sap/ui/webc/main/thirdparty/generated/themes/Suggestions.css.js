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
    fileName: "themes/Suggestions.css",
    content: ".ui5-suggestions-popover {\n\tbox-shadow: var(--sapContent_Shadow1);\n}\n\n.ui5-suggestions-popover::part(header),\n.ui5-suggestions-popover::part(content) {\n\tpadding: 0;\n}\n\n.ui5-suggestions-popover::part(footer) {\n\tpadding: 0 1rem;\n}\n\n.ui5-suggestions-popover [ui5-li],\n.ui5-suggestions-popover [ui5-li-suggestion-item] {\n\theight: var(--_ui5_list_item_dropdown_base_height);\n}\n\n.ui5-suggestions-popover [ui5-li]::part(icon),\n.ui5-suggestions-popover [ui5-li-suggestion-item]::part(icon) {\n\tcolor: var(--sapList_TextColor);\n}\n\n.input-root-phone.native-input-wrapper {\n\tdisplay: contents;\n}\n\n.input-root-phone.native-input-wrapper::before {\n\tdisplay: none;\n}\n\n.native-input-wrapper .ui5-input-inner-phone {\n\tmargin: 0;\n}"
  };
  var _default = styleData;
  _exports.default = _default;
});