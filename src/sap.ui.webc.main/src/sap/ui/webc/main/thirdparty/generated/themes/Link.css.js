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
    content: ".ui5-hidden-text {\n\tposition: absolute;\n\tclip: rect(1px,1px,1px,1px);\n\tuser-select: none;\n\tleft: -1000px; /* ensure the invisible texts are never part of the viewport */\n\ttop: -1000px;\n\tpointer-events: none;\n\tfont-size: 0;\n}\n\n:host(:not([hidden])) {\n\tdisplay: inline-flex;\n}\n\n:host {\n\tmax-width: 100%;\n\tcolor: var(--sapLinkColor);\n\tfont-family: var(--sapFontFamily);\n\tfont-size: var(--sapFontSize);\n\tcursor: pointer;\n\toutline: none;\n\ttext-decoration: var(--_ui5_link_text_decoration);\n\ttext-shadow: var(--sapContent_TextShadow);\n\twhite-space: nowrap;\n\toverflow-wrap: normal;\n}\n\n:host(:hover) {\n\tcolor: var(--sapLink_Hover_Color);\n\ttext-decoration: var(--_ui5_link_hover_text_decoration);\n}\n\n:host(:active) {\n\tcolor: var(--sapLink_Active_Color);\n\ttext-decoration: var(--_ui5_link_active_text_decoration);\n}\n\n:host([disabled]) {\n\tpointer-events: none;\n}\n\n:host([disabled]) .ui5-link-root {\n\ttext-shadow: none;\n\toutline: none;\n\tcursor: default;\n\tpointer-events: none;\n\topacity: var(--sapContent_DisabledOpacity);\n}\n\n:host([design=\"Emphasized\"]) .ui5-link-root {\n\tfont-family: var(--sapFontBoldFamily);\n}\n\n:host([design=\"Subtle\"]) {\n\tcolor: var(--sapLink_SubtleColor);\n\ttext-decoration: var(--_ui5_link_subtle_text_decoration);\n}\n\n:host([design=\"Subtle\"]:hover:not(:active)) {\n\tcolor: var(--sapLink_SubtleColor);\n\ttext-decoration: var(--_ui5_link_subtle_text_decoration_hover);\n}\n\n:host([wrapping-type=\"Normal\"]) {\n\twhite-space: normal;\n\toverflow-wrap: break-word;\n}\n\n.ui5-link-root {\n\twidth: 100%;\n\tdisplay: inline-block;\n\tposition: relative;\n\toverflow: hidden;\n\ttext-overflow: ellipsis;\n\toutline: none;\n\twhite-space: inherit;\n\toverflow-wrap: inherit;\n\ttext-decoration: inherit;\n\tcolor: inherit;\n}\n\n:host .ui5-link-root {\n\tborder: var(--_ui5_link_border);\n\tborder-radius: var(--_ui5_link_focus_border-radius);\n}\n\n:host([focused]) .ui5-link-root,\n:host([design=\"Subtle\"][focused]) .ui5-link-root {\n\tbackground-color: var(--_ui5_link_focus_background_color);\n\tborder: var(--_ui5_link_border_focus);\n\tborder-radius: var(--_ui5_link_focus_border-radius);\n\ttext-shadow: none;\n}\n\n:host([focused]),\n:host([design=\"Subtle\"][focused]) {\n\tcolor:  var(--_ui5_link_focus_color);\n\ttext-decoration: var(--_ui5_link_focus_text_decoration);\n}\n\n:host([focused]:hover:not(:active)) {\n\tcolor: var(--_ui5_link_focused_hover_text_color);\n\ttext-decoration: var(--_ui5_link_focused_hover_text_decoration);\n}"
  };
  var _default = styleData;
  _exports.default = _default;
});