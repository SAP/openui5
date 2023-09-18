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
    fileName: "themes/Icon.css",
    content: ":host{-webkit-tap-highlight-color:rgba(0,0,0,0)}:host([hidden]){display:none}:host([invalid]){display:none}:host(:not([hidden]).ui5_hovered){opacity:.7}:host{fill:currentColor;color:var(--sapContent_NonInteractiveIconColor);display:inline-block;height:1rem;outline:none;width:1rem}:host([design=Contrast]){color:var(--sapContent_ContrastIconColor)}:host([design=Critical]){color:var(--sapCriticalElementColor)}:host([design=Default]){color:var(--sapContent_IconColor)}:host([design=Information]){color:var(--sapInformativeElementColor)}:host([design=Negative]){color:var(--sapNegativeElementColor)}:host([design=Neutral]){color:var(--sapNeutralElementColor)}:host([design=NonInteractive]){color:var(--sapContent_NonInteractiveIconColor)}:host([design=Positive]){color:var(--sapPositiveElementColor)}:host([interactive][focused]) .ui5-icon-root{border-radius:var(--ui5-v1-18-0-icon-focus-border-radius);outline:var(--sapContent_FocusWidth) var(--sapContent_FocusStyle) var(--sapContent_FocusColor)}.ui5-icon-root{display:flex;height:100%;outline:none;vertical-align:top;width:100%}:host([interactive]){cursor:pointer}.ui5-icon-root:not([dir=ltr]){transform:var(--_ui5-v1-18-0_icon_transform_scale);transform-origin:center}"
  };
  var _default = styleData;
  _exports.default = _default;
});