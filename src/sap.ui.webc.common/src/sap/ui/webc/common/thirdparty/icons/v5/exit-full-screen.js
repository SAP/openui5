sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons", "../generated/i18n/i18n-defaults"], function (_exports, _Icons, _i18nDefaults) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "exit-full-screen";
  const pathData = "M185.5 302q11 0 18.5 7.5t7.5 18.5v128q0 11-7.5 18t-18.5 7-18-7-7-18v-66l-71 70q-7 7-18 7t-18-7q-8-8-8-18t8-18l70-70h-66q-11 0-18-7.5t-7-18.5 7-18.5 18-7.5h128zm281-153q11 0 18.5 7.5t7.5 18.5-7.5 18-18.5 7h-127q-11 0-18.5-7t-7.5-18V47q0-11 7.5-18.5t18.5-7.5 18 7.5 7 18.5v66l70-70q8-8 18.5-8t18.5 8q7 8 7 18t-7 18l-71 70h66zm-358 75q-12 0-19.5-7t-7.5-19v-54q0-34 23-57t57-23h53q12 0 19.5 7.5t7.5 19.5-7.5 19.5-19.5 7.5h-53q-26 0-26 26v54q0 12-7.5 19t-19.5 7zm333 63q12 0 19 7.5t7 19.5v53q0 34-22.5 57t-57.5 23h-53q-12 0-19-7.5t-7-19.5 7-19.5 19-7.5h54q11 0 18.5-7t7.5-19v-54q0-12 7.5-19t19.5-7z";
  _exports.pathData = pathData;
  const ltr = false;
  _exports.ltr = ltr;
  const accData = _i18nDefaults.ICON_EXIT_FULL_SCREEN;
  _exports.accData = accData;
  const collection = "SAP-icons-v5";
  const packageName = "@ui5/webcomponents-icons";
  (0, _Icons.registerIcon)(name, {
    pathData,
    ltr,
    accData,
    collection,
    packageName
  });
  var _default = "SAP-icons-v5/exit-full-screen";
  _exports.default = _default;
});