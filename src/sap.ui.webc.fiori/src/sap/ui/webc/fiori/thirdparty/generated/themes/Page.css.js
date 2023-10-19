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
    fileName: "themes/Page.css",
    content: ":host(:not([hidden])){display:block;height:100%;width:100%}.ui5-page-root{background-color:inherit;box-sizing:border-box;height:inherit;overflow:hidden;position:relative;z-index:0}.ui5-page-header-root{z-index:1}.ui5-page-content-root{bottom:0;box-sizing:border-box;overflow:hidden auto;position:absolute;top:2.75rem;width:100%;will-change:scroll-position}.ui5-page-footer-root{bottom:0;box-sizing:border-box;left:0;position:absolute;width:100%;z-index:2}:host([floating-footer]) .ui5-page-footer-root{bottom:.5rem;opacity:1}:host([media-range=S]) .ui5-page-content-root,:host([media-range=S][floating-footer]) .ui5-page-footer-root{padding:0 1rem}:host([media-range=S]) ::slotted([ui5-bar][slot=header]){box-sizing:border-box;padding:0 .25rem}:host([media-range=S]) ::slotted([ui5-bar][design=Footer]){box-sizing:border-box;padding:0 .25rem}:host([media-range=L]) .ui5-page-content-root,:host([media-range=L][floating-footer]) .ui5-page-footer-root,:host([media-range=M]) .ui5-page-content-root,:host([media-range=M][floating-footer]) .ui5-page-footer-root{padding:0 2rem}:host([media-range=L]) ::slotted([ui5-bar][slot=header]),:host([media-range=M]) ::slotted([ui5-bar][slot=header]){box-sizing:border-box;padding:0 1.25rem}:host([media-range=L]) ::slotted([ui5-bar][design=Footer]),:host([media-range=M]) ::slotted([ui5-bar][design=Footer]){box-sizing:border-box;padding:0 1.25rem}:host([media-range=XL]) .ui5-page-content-root,:host([media-range=XL][floating-footer]) .ui5-page-footer-root{padding:0 3rem}:host([media-range=XL]) ::slotted([ui5-bar][slot=header]){box-sizing:border-box;padding:0 2.25rem}:host([media-range=XL]) ::slotted([ui5-bar][design=Footer]){box-sizing:border-box;padding:0 2.25rem}:host([disable-scrolling]) .ui5-page-content-root{overflow:hidden}:host([hide-footer]:not([floating-footer])) .ui5-page-footer-root{display:none}:host([floating-footer]:not([hide-footer])) .ui5-page-footer-root{animation:bounceShow .35s ease-in-out forwards}:host([floating-footer][hide-footer]) .ui5-page-footer-root{animation:bounceHide .35s ease-in-out forwards}:host([background-design=Solid]){background-color:var(--sapBackgroundColor)}:host([background-design=Transparent]){background-color:var(--_ui5-v1-18-0_page_transparent_bg)}:host([background-design=List]){background-color:var(--_ui5-v1-18-0_page_list_bg)}@keyframes bounceShow{0%{opacity:0;transform:translateY(100%)}to{opacity:1}}@keyframes bounceHide{0%{opacity:1;transform:translateY(-5%)}to{opacity:0;transform:translateY(100%)}}"
  };
  var _default = styleData;
  _exports.default = _default;
});