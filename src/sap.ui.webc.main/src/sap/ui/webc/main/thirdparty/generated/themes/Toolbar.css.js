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
    fileName: "themes/Toolbar.css",
    content: ":host(:not([hidden])){align-items:center;background:var(--ui5-v1-18-0-toolbar-Background);border-bottom:.0625rem solid var(--sapGroup_ContentBorderColor);box-sizing:border-box;color:var(--sapButton_TextColor);display:flex;height:var(--_ui5-v1-18-0-toolbar-height);justify-content:flex-end;padding:0 var(--_ui5-v1-18-0-toolbar-padding-left) 0 var(--_ui5-v1-18-0-toolbar-padding-right);width:100%}:host([design=Solid]){background:var(--sapBaseColor)}:host([design=Transparent]){background:var(--sapToolbar_Background)}:host([styling=Clear]){border-bottom:0}:host([align-content=Start]){justify-content:flex-start}.ui5-tb-items{align-items:inherit;display:inherit;height:100%;justify-content:inherit;width:100%}.ui5-tb-items-full-width{width:100%}.ui5-tb-item[design=Transparent]{color:inherit}.ui5-tb-item{flex-shrink:0}.ui5-tb-item:not(:last-child){margin-inline-end:var(--_ui5-v1-18-0-toolbar-item-margin-right);margin-inline-start:var(--_ui5-v1-18-0-toolbar-item-margin-left)}.ui5-tb-separator{background:var(--sapToolbar_SeparatorColor);box-sizing:border-box;height:var(--_ui5-v1-18-0-toolbar-separator-height);width:.0625rem}.ui5-tb-overflow-btn-hidden{position:absolute;visibility:hidden}"
  };
  var _default = styleData;
  _exports.default = _default;
});