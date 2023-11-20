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
    fileName: "themes/DateTimePickerPopover.css",
    content: ".ui5-dt-picker-content{box-sizing:border-box;display:flex;flex-direction:row;height:var(--_ui5-v1-18-0_datetime_picker_height);justify-content:center;min-width:var(--_ui5-v1-18-0_datetime_picker_width)}.ui5-dt-picker-toggle-button{width:8rem}.ui5-dt-cal{box-sizing:border-box;width:auto}.ui5-dt-time{box-sizing:border-box;min-width:var(--_ui5-v1-18-0_datetime_timeview_width);width:100%}.ui5-dt-cal.ui5-dt-cal--hidden,.ui5-dt-time.ui5-dt-time--hidden{display:none}.ui5-dt-picker-header{box-sizing:border-box;display:flex;justify-content:center;margin-top:1rem;width:100%}.ui5-dt-picker-separator{border-left:1px solid var(--sapGroup_ContentBorderColor);box-sizing:border-box;height:calc(100% - 2rem);margin-bottom:1rem;margin-top:1rem;width:0}.ui5-dt-picker-footer{align-items:center;display:flex;height:2.75rem;justify-content:flex-end;width:100%}.ui5-dt-picker-footer.ui5-dt-picker-footer-time-hidden{padding:0}.ui5-dt-picker-action{margin:.25rem}#ok.ui5-dt-picker-action{width:4rem}.ui5-dt-picker-content--phone.ui5-dt-picker-content{height:calc(100% - 4rem);min-width:auto}.ui5-dt-picker-content--phone .ui5-dt-cal{width:100%}.ui5-dt-picker-content--phone .ui5-dt-time{min-width:var(--_ui5-v1-18-0_datetime_timeview_phonemode_width)}"
  };
  var _default = styleData;
  _exports.default = _default;
});