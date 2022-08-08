sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons", "../generated/i18n/i18n-defaults"], function (_exports, _Icons, _i18nDefaults) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "drill-down";
  const pathData = "M106 55q-9-10-9-22.5t9-22.5q10-9 22.5-9t22.5 9l105 106L362 10q10-9 22.5-9t22.5 9q9 10 9 22.5T407 55L279 183q-10 10-22.5 10T234 183zm256 115q10-10 22.5-10t22.5 10q9 10 9 22.5t-9 22.5L279 342q-10 10-22.5 10T234 342L106 215q-9-10-9-22.5t9-22.5q10-10 22.5-10t22.5 10l105 105zm0 160q10-10 22.5-10t22.5 10q9 9 9 22t-9 22L279 502q-10 10-22.5 10T234 502L106 374q-9-9-9-22t9-22q10-10 22.5-10t22.5 10l105 105z";
  _exports.pathData = pathData;
  const ltr = false;
  _exports.ltr = ltr;
  const accData = _i18nDefaults.ICON_DRILL_DOWN;
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
  var _default = "drill-down";
  _exports.default = _default;
});