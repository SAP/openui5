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
    fileName: "themes/Popover.css",
    content: ":host {\n\tbox-shadow: var(--_ui5_popover_box_shadow);\n\tbackground-color: var(--_ui5_popover_background);\n\tmax-width: calc(100vw - (100vw - 100%) - 2 * var(--_ui5_popup_viewport_margin));\n}\n\n:host([hide-arrow]) {\n\tbox-shadow: var(--_ui5_popover_no_arrow_box_shadow);\n}\n\n:host([opened][actual-placement-type=\"Top\"]) {\n\tmargin-top: var(--_ui5-popover-margin-bottom);\n}\n\n:host([opened][actual-placement-type=\"Bottom\"]) {\n\tmargin-top: var(--_ui5-popover-margin-top);\n}\n\n/* pointing upward arrow */\n\n:host([actual-placement-type=\"Bottom\"]) .ui5-popover-arrow {\n\tleft: calc(50% - 0.5625rem);\n\ttop: -0.5rem;\n\theight: 0.5625rem;\n}\n\n:host([actual-placement-type=\"Bottom\"]) .ui5-popover-arrow:after {\n\tmargin: var(--_ui5_popover_upward_arrow_margin);\n}\n\n/* pointing right arrow */\n\n:host([actual-placement-type=\"Left\"]) .ui5-popover-arrow {\n\ttop: calc(50% - 0.5625rem);\n\tright: -0.5625rem;\n\twidth: 0.5625rem;\n}\n\n:host([actual-placement-type=\"Left\"]) .ui5-popover-arrow:after {\n\tmargin: var(--_ui5_popover_right_arrow_margin);\n}\n\n/* pointing downward arrow */\n\n:host([actual-placement-type=\"Top\"]) .ui5-popover-arrow {\n\tleft: calc(50% - 0.5625rem);\n\theight: 0.5625rem;\n\ttop: 100%;\n}\n\n:host([actual-placement-type=\"Top\"]) .ui5-popover-arrow:after {\n\tmargin: var(--_ui5_popover_downward_arrow_margin);\n}\n\n/* pointing left arrow */\n\n:host(:not([actual-placement-type])) .ui5-popover-arrow,\n:host([actual-placement-type=\"Right\"]) .ui5-popover-arrow {\n\tleft: -0.5625rem;\n\ttop: calc(50% - 0.5625rem);\n\twidth: 0.5625rem;\n\theight: 1rem;\n}\n\n:host(:not([actual-placement-type])) .ui5-popover-arrow:after,\n:host([actual-placement-type=\"Right\"]) .ui5-popover-arrow:after {\n\tmargin: var(--_ui5_popover_left_arrow_margin);\n}\n\n:host([hide-arrow]) .ui5-popover-arrow {\n\tdisplay: none;\n}\n\n.ui5-popover-root {\n\tmin-width: 6.25rem;\n}\n\n.ui5-popover-arrow {\n\tpointer-events: none;\n\tdisplay: block;\n\twidth: 1rem;\n\theight: 1rem;\n\tposition: absolute;\n\toverflow: hidden;\n}\n\n.ui5-popover-arrow:after {\n\tcontent: \"\";\n\tdisplay: block;\n\twidth: 0.7rem;\n\theight: 0.7rem;\n\tbackground-color: var(--_ui5_popover_background);\n\tbox-shadow: var(--_ui5_popover_box_shadow);\n\ttransform: rotate(-45deg);\n}\n"
  };
  var _default = styleData;
  _exports.default = _default;
});