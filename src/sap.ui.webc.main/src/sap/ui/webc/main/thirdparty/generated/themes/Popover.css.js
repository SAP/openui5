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
    content: ":host{background-color:var(--_ui5-v1-18-0_popover_background);box-shadow:var(--_ui5-v1-18-0_popover_box_shadow);max-width:calc(100% - var(--_ui5-v1-18-0_popup_viewport_margin)*2)}:host([hide-arrow]){box-shadow:var(--_ui5-v1-18-0_popover_no_arrow_box_shadow)}:host([opened][actual-placement-type=Top]){margin-top:var(--_ui5-v1-18-0-popover-margin-bottom)}:host([opened][actual-placement-type=Bottom]){margin-top:var(--_ui5-v1-18-0-popover-margin-top)}:host([actual-placement-type=Bottom]) .ui5-popover-arrow{height:.5625rem;left:calc(50% - .5625rem);top:-.5rem}:host([actual-placement-type=Bottom]) .ui5-popover-arrow:after{margin:var(--_ui5-v1-18-0_popover_upward_arrow_margin)}:host([actual-placement-type=Left]) .ui5-popover-arrow{right:-.5625rem;top:calc(50% - .5625rem);width:.5625rem}:host([actual-placement-type=Left]) .ui5-popover-arrow:after{margin:var(--_ui5-v1-18-0_popover_right_arrow_margin)}:host([actual-placement-type=Top]) .ui5-popover-arrow{height:.5625rem;left:calc(50% - .5625rem);top:100%}:host([actual-placement-type=Top]) .ui5-popover-arrow:after{margin:var(--_ui5-v1-18-0_popover_downward_arrow_margin)}:host(:not([actual-placement-type])) .ui5-popover-arrow,:host([actual-placement-type=Right]) .ui5-popover-arrow{height:1rem;left:-.5625rem;top:calc(50% - .5625rem);width:.5625rem}:host(:not([actual-placement-type])) .ui5-popover-arrow:after,:host([actual-placement-type=Right]) .ui5-popover-arrow:after{margin:var(--_ui5-v1-18-0_popover_left_arrow_margin)}:host([hide-arrow]) .ui5-popover-arrow{display:none}.ui5-popover-root{min-width:6.25rem}.ui5-popover-arrow{display:block;height:1rem;overflow:hidden;pointer-events:none;position:absolute;width:1rem}.ui5-popover-arrow:after{background-color:var(--_ui5-v1-18-0_popover_background);box-shadow:var(--_ui5-v1-18-0_popover_box_shadow);content:\"\";display:block;height:.7rem;transform:rotate(-45deg);width:.7rem}"
  };
  var _default = styleData;
  _exports.default = _default;
});