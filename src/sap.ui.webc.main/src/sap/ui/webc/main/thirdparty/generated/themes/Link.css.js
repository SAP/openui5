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
    fileName: "themes/Link.css",
    content: ".ui5-hidden-text{position:absolute;clip:rect(1px,1px,1px,1px);user-select:none;left:-1000px;top:-1000px;pointer-events:none;font-size:0}:host(:not([hidden])){display:inline-flex}:host{max-width:100%;color:var(--sapLinkColor);font-family:var(--sapFontFamily);font-size:var(--sapFontSize);cursor:pointer;outline:none;text-decoration:var(--_ui5_link_text_decoration);text-shadow:var(--sapContent_TextShadow)}:host([disabled]){pointer-events:none}:host([disabled]) .ui5-link-root{text-shadow:none;outline:none;cursor:default;pointer-events:none;opacity:var(--sapContent_DisabledOpacity)}:host([design=Emphasized]) .ui5-link-root{font-family:var(--sapFontBoldFamily)}:host([design=Subtle]) .ui5-link-root{color:var(--sapLink_SubtleColor);text-decoration:var(--_ui5_link_subtle_text_decoration)}:host([design=Subtle]) .ui5-link-root:focus{color:var(--sapLinkColor)}:host([wrapping-type=Normal]) .ui5-link-root{white-space:normal;word-wrap:break-word}.ui5-link-root{width:100%;display:inline-block;position:relative;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;word-wrap:normal;outline:none;text-decoration:inherit;color:inherit}:host(:active) .ui5-link-root{color:var(--sapLink_Active_Color);text-decoration:var(--_ui5_link_active_text_decoration)}:host .ui5-link-root{border:var(--_ui5_link_border);border-radius:var(--_ui5_link_focus_border-radius)}:host([design=Subtle][focused]) .ui5-link-root,:host([focused]) .ui5-link-root{background-color:var(--_ui5_link_focus_background_color);color:var(--_ui5_link_focus_color);border:var(--_ui5_link_border_focus);border-radius:var(--_ui5_link_focus_border-radius);text-decoration:var(--_ui5_link_focus_text_decoration);text-shadow:none}:host(:hover){color:var(--sapLink_Hover_Color);text-decoration:var(--_ui5_link_hover_text_decoration)}:host([focused]:hover){text-decoration:var(--_ui5_link_focused_hover_text_decoration)}:host([focused]:hover) .ui5-link-root{color:var(--_ui5_link_focused_hover_text_color)}"
  };
  _exports.default = _default;
});