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
    fileName: "themes/CustomListItem.css",
    content: "\n:host(:not([hidden])) {\n\tdisplay: block;\n}\n\n:host {\n\tmin-height: var(--_ui5_list_item_base_height);\n\theight: auto;\n\tbox-sizing: border-box;\n}\n\n.ui5-li-root.ui5-custom-li-root {\n\tpointer-events: inherit;\n\tmin-height: inherit;\n}\n\n.ui5-li-root.ui5-custom-li-root .ui5-li-content {\n\tpointer-events: inherit;\n}\n\n[ui5-checkbox].ui5-li-singlesel-radiobtn,\n[ui5-radio-button].ui5-li-singlesel-radiobtn {\n\tdisplay: flex;\n\talign-items: center;\n}\n\n.ui5-li-root.ui5-custom-li-root,\n[ui5-checkbox].ui5-li-singlesel-radiobtn,\n[ui5-radio-button].ui5-li-singlesel-radiobtn {\n\tmin-width: var(--_ui5_custom_list_item_rb_min_width);\n}\n"
  };
  var _default = styleData;
  _exports.default = _default;
});