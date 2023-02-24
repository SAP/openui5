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
    fileName: "themes/Popover.css",
    content: ".ui5-popover-arrow{pointer-events:none;display:block;width:1rem;height:1rem;position:absolute;overflow:hidden}.ui5-popover-arrow:after{content:\"\";display:block;width:.7rem;height:.7rem;background-color:var(--sapGroup_ContentBackground);box-shadow:var(--sapContent_Shadow3);transform:rotate(-45deg)}:host{max-width:calc(100% - var(--_ui5_popup_viewport_margin)*2)}:host([opened][actual-placement-type=Top]){margin-top:var(--_ui5-popover-margin-bottom)}:host([opened][actual-placement-type=Bottom]){margin-top:var(--_ui5-popover-margin-top)}:host([actual-placement-type=Bottom]) .ui5-popover-arrow{left:calc(50% - .5625rem);top:-.5rem;height:.5625rem}:host([actual-placement-type=Bottom]) .ui5-popover-arrow:after{margin:var(--_ui5_popover_upward_arrow_margin)}:host([actual-placement-type=Left]) .ui5-popover-arrow{top:calc(50% - .5625rem);right:-.5625rem;width:.5625rem}:host([actual-placement-type=Left]) .ui5-popover-arrow:after{margin:var(--_ui5_popover_right_arrow_margin)}:host([actual-placement-type=Top]) .ui5-popover-arrow{left:calc(50% - .5625rem);height:.5625rem;top:100%}:host([actual-placement-type=Top]) .ui5-popover-arrow:after{margin:var(--_ui5_popover_downward_arrow_margin)}:host(:not([actual-placement-type])) .ui5-popover-arrow,:host([actual-placement-type=Right]) .ui5-popover-arrow{left:-.5625rem;top:calc(50% - .5625rem);width:.5625rem;height:1rem}:host(:not([actual-placement-type])) .ui5-popover-arrow:after,:host([actual-placement-type=Right]) .ui5-popover-arrow:after{margin:var(--_ui5_popover_left_arrow_margin)}:host([hide-arrow]) .ui5-popover-arrow{display:none}.ui5-popover-root{min-width:6.25rem}"
  };
  _exports.default = _default;
});