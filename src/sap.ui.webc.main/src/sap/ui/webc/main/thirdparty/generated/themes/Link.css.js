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
    fileName: "themes/Link.css",
    content: ".ui5-hidden-text{clip:rect(1px,1px,1px,1px);font-size:0;left:-1000px;pointer-events:none;position:absolute;top:-1000px;user-select:none}:host(:not([hidden])){display:inline-flex}:host{color:var(--sapLinkColor);cursor:pointer;font-family:var(--sapFontFamily);font-size:var(--sapFontSize);max-width:100%;outline:none;overflow-wrap:normal;text-decoration:var(--_ui5-v1-18-0_link_text_decoration);text-shadow:var(--sapContent_TextShadow);white-space:nowrap}:host(:hover){color:var(--sapLink_Hover_Color);text-decoration:var(--_ui5-v1-18-0_link_hover_text_decoration)}:host(:active){color:var(--sapLink_Active_Color);text-decoration:var(--_ui5-v1-18-0_link_active_text_decoration)}:host([disabled]){pointer-events:none}:host([disabled]) .ui5-link-root{cursor:default;opacity:var(--sapContent_DisabledOpacity);outline:none;pointer-events:none;text-shadow:none}:host([design=Emphasized]) .ui5-link-root{font-family:var(--sapFontBoldFamily)}:host([design=Subtle]){color:var(--sapLink_SubtleColor);text-decoration:var(--_ui5-v1-18-0_link_subtle_text_decoration)}:host([design=Subtle]:hover:not(:active)){color:var(--sapLink_SubtleColor);text-decoration:var(--_ui5-v1-18-0_link_subtle_text_decoration_hover)}:host([wrapping-type=Normal]){overflow-wrap:break-word;white-space:normal}.ui5-link-root{color:inherit;display:inline-block;max-width:100%;outline:none;overflow:hidden;overflow-wrap:inherit;position:relative;text-decoration:inherit;text-overflow:ellipsis;white-space:inherit}:host .ui5-link-root{border:var(--_ui5-v1-18-0_link_border);border-radius:var(--_ui5-v1-18-0_link_focus_border-radius)}:host([design=Subtle][focused]) .ui5-link-root,:host([focused]) .ui5-link-root{background-color:var(--_ui5-v1-18-0_link_focus_background_color);border:var(--_ui5-v1-18-0_link_border_focus);border-radius:var(--_ui5-v1-18-0_link_focus_border-radius);text-shadow:none}:host([design=Subtle][focused]),:host([focused]){color:var(--_ui5-v1-18-0_link_focus_color);text-decoration:var(--_ui5-v1-18-0_link_focus_text_decoration)}:host([focused]:hover:not(:active)){color:var(--_ui5-v1-18-0_link_focused_hover_text_color);text-decoration:var(--_ui5-v1-18-0_link_focused_hover_text_decoration)}"
  };
  var _default = styleData;
  _exports.default = _default;
});