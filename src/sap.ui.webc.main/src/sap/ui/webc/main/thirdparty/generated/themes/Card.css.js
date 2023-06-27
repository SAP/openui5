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
    fileName: "themes/Card.css",
    content: ".ui5-hidden-text {\n\tposition: absolute;\n\tclip: rect(1px,1px,1px,1px);\n\tuser-select: none;\n\tleft: -1000px; /* ensure the invisible texts are never part of the viewport */\n\ttop: -1000px;\n\tpointer-events: none;\n\tfont-size: 0;\n}\n\n:host(:not([hidden])) {\n\tdisplay: inline-block;\n\twidth: 100%;\n}\n\n.ui5-card-root {\n\twidth: 100%;\n\theight: 100%;\n\tcolor: var(--sapGroup_TitleTextColor);\n\tbackground: var(--sapTile_Background);\n\tbox-shadow: var(--_ui5_card_box_shadow);\n\tborder-radius: var(--_ui5_card_border-radius);\n\tborder: var(--_ui5_card_border);\n\toverflow: hidden;\n\tfont-family: \"72override\", var(--sapFontFamily);\n\tfont-size: var(--sapFontSize);\n\tbox-sizing: border-box;\n}\n\n.ui5-card-root.ui5-card--interactive:hover {\n\tbox-shadow: var(--_ui5_card_hover_box_shadow);\n}\n\n.ui5-card-root.ui5-card--interactive:active {\n\tbox-shadow: var(--_ui5_card_box_shadow);\n}\n\n/* Card with no content */\n\n.ui5-card-root.ui5-card--nocontent {\n\theight: auto;\n}\n\n.ui5-card-root.ui5-card--nocontent .ui5-card-header-root  {\n    border-bottom: none;\n}\n\n.ui5-card--nocontent ::slotted([ui5-card-header]) {\n\t--_ui5_card_header_focus_bottom_radius: var(--_ui5_card_header_focus_radius);\n}\n\n.ui5-card-root .ui5-card-header-root {\n\tborder-bottom: var(--_ui5_card_header_border);\n}\n"
  };
  var _default = styleData;
  _exports.default = _default;
});