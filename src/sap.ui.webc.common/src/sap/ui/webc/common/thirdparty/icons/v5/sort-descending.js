sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons", "../generated/i18n/i18n-defaults"], function (_exports, _Icons, _i18nDefaults) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "sort-descending";
  const pathData = "M186.5 340q7-7 18-7t18.5 7 7.5 18-8 19l-77 76q-6 8-18 8-10 0-18-8l-77-76q-7-7-7-19 0-11 7.5-18t18.5-7 18 7l33 33V77q0-11 7-18.5t18-7.5 18.5 7.5 7.5 18.5v296zm172-84q11 0 18 7.5t7 18.5-7 18-18 7h-77q-11 0-18.5-7t-7.5-18 7.5-18.5 18.5-7.5h77zm102-205q11 0 18.5 7.5t7.5 18.5-7.5 18-18.5 7h-179q-11 0-18.5-7t-7.5-18 7.5-18.5 18.5-7.5h179zm-51 103q11 0 18.5 7t7.5 18-7.5 18.5-18.5 7.5h-128q-11 0-18.5-7.5t-7.5-18.5 7.5-18 18.5-7h128z";
  _exports.pathData = pathData;
  const ltr = false;
  _exports.ltr = ltr;
  const accData = _i18nDefaults.ICON_SORT_DESCENDING;
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
  var _default = "sort-descending";
  _exports.default = _default;
});