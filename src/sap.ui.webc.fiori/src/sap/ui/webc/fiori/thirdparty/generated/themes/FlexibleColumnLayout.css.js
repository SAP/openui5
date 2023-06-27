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
    fileName: "themes/FlexibleColumnLayout.css",
    content: ".ui5-hidden-text {\n\tposition: absolute;\n\tclip: rect(1px,1px,1px,1px);\n\tuser-select: none;\n\tleft: -1000px; /* ensure the invisible texts are never part of the viewport */\n\ttop: -1000px;\n\tpointer-events: none;\n\tfont-size: 0;\n}\n\n:host(:not([hidden])) {\n\tdisplay: block;\n\tbackground: var(--_ui5_fcl_solid_bg);\n}\n\n.ui5-fcl-root {\n\theight: 100%;\n\tdisplay: flex;\n\tflex-direction: row;\n}\n\n/* columns */\n\n.ui5-fcl-column {\n\tbackground: inherit;\n\tbox-sizing: border-box;\n\twill-change: width;\n\toverflow-y: auto;\n}\n\n.ui5-fcl-column-animation {\n\ttransition: width 560ms cubic-bezier(0.1, 0, 0.05, 1), visibility 560ms ease-in;\n}\n\n:host([_visible-columns=\"2\"]) .ui5-fcl-column--start {\n\tborder-inline-end: var(--_ui5_fcl_column_border);\n}\n\n:host([_visible-columns=\"3\"]) .ui5-fcl-column--start {\n\tborder-inline-end: var(--_ui5_fcl_column_border);\n}\n\n:host([_visible-columns=\"2\"]) .ui5-fcl-column--middle {\n\tborder-inline-start: var(--_ui5_fcl_column_border)\n}\n\n:host([_visible-columns=\"3\"]) .ui5-fcl-column--middle {\n\tborder-inline-start: var(--_ui5_fcl_column_border)\n}\n\n:host([_visible-columns=\"3\"]) .ui5-fcl-column--middle {\n\tborder-inline-end: var(--_ui5_fcl_column_border)\n}\n\n:host([_visible-columns=\"3\"]) .ui5-fcl-column--end {\n\tborder-inline-start: var(--_ui5_fcl_column_border);\n}\n\n.ui5-fcl-column--hidden {\n\tdisplay: none;\n}\n\n/* arrow */\n\n.ui5-fcl-arrow-container {\n\tdisplay: flex;\n\talign-items: center;\n\tjustify-content: center;\n\twidth: 1rem;\n\tbackground-color: var(--sapShell_Background);\n}\n\n.ui5-fcl-arrow {\n\tposition: relative;\n\twidth: 1.5rem;\n\theight: 1.5rem;\n\tmin-width: 1.5rem;\n\twill-change: transform;\n\toverflow: visible;\n\tz-index: 1;\n}\n\n/* arrow decoration */\n\n.ui5-fcl-arrow:before {\n\tbackground-image: var(--_ui5_fcl_decoration_top);\n\tbackground-position-y: -0.3125rem;\n\tbottom: 100%;\n}\n\n.ui5-fcl-arrow:after {\n\tbackground-image: var(--_ui5_fcl_decoration_bottom);\n\tbackground-position-y: 0.3125rem;\n\ttop: 100%;\n}\n\n.ui5-fcl-arrow:before,\n.ui5-fcl-arrow:after {\n\tcontent: '';\n\tposition: absolute;\n\tleft: 0;\n\theight: 4rem;\n\twidth: 100%;\n\ttransition: all 0.1s ease-in;\n\tbackground-repeat: no-repeat;\n\tbackground-size: 0.0625rem 100%;\n\tbackground-position-x: calc(50% - 0.03125rem);\n}\n\n.ui5-fcl-arrow:hover:before,\n.ui5-fcl-arrow:hover:after {\n\theight: 7rem;\n}\n"
  };
  var _default = styleData;
  _exports.default = _default;
});