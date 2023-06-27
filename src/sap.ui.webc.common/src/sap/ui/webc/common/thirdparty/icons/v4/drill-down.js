sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons", "../generated/i18n/i18n-defaults"], function (_exports, _Icons, _i18nDefaults) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "drill-down";
  const pathData = "M394 327q11-9 23-9.5t22 9.5q9 9 9 22.5t-9 22.5L279 501q-9 10-22.5 10T234 501L74 370q-10-9-10-22.5T74 325q9-10 21.5-9.5T119 325l126 97q5 5 11.5 5t11.5-5zm-22-146q21-17 38 0 8 8 8 18.5t-8 18.5L275 327q-8 8-19 8t-19-8L103 217q-8-8-8-19t8-19 18.5-8 19.5 8l106 82q4 4 9.5 4t9.5-4zM361 41q18-15 33 0 7 7 7 16.5T394 74l-120 97q-7 8-16.5 8t-17.5-8L120 73q-7-7-7-17t7-17 16.5-7 17.5 7l95 73q8 9 17 0z";
  _exports.pathData = pathData;
  const ltr = false;
  _exports.ltr = ltr;
  const accData = _i18nDefaults.ICON_DRILL_DOWN;
  _exports.accData = accData;
  const collection = "SAP-icons-v4";
  const packageName = "@ui5/webcomponents-icons";
  (0, _Icons.registerIcon)(name, {
    pathData,
    ltr,
    accData,
    collection,
    packageName
  });
  var _default = "SAP-icons-v4/drill-down";
  _exports.default = _default;
});