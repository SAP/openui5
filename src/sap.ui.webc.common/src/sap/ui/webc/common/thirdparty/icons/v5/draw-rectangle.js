sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "draw-rectangle";
  const pathData = "M512 256q0 14-7 26t-19 18v117q12 6 19 18t7 26q0 21-15 36t-36 15q-14 0-26-7t-18-19H300q-6 12-18 19t-26 7-25.5-7-17.5-19H95q-5 12-17 19t-26 7q-21 0-36-15T1 461q0-14 7-26t18-18V300q-11-6-18-18t-7-26 7-26 18-17V95Q15 90 8 78T1 52q0-21 15-36T52 1q14 0 26 7t17 18h118q6-11 17.5-18T256 1t26 7 18 18h117q6-11 18-18t26-7q21 0 36 15t15 36q0 14-7 26t-19 17v118q12 5 19 17t7 26zm-77 44q-11-6-18-18t-7-26 7-26 18-17V95q-11-7-18-18H300q-6 12-18 19t-26 7-25.5-7T213 77H95q-7 11-18 18v118q12 5 19 17t7 26-7 26-19 18v117q11 7 18 18h118q6-11 17.5-18t25.5-7 26 7 18 18h117q7-11 18-18V300z";
  _exports.pathData = pathData;
  const ltr = false;
  _exports.ltr = ltr;
  const accData = null;
  _exports.accData = accData;
  const collection = "SAP-icons-v5";
  const packageName = "@ui5/webcomponents-icons";
  (0, _Icons.registerIcon)(name, {
    pathData,
    ltr,
    collection,
    packageName
  });
  var _default = "draw-rectangle";
  _exports.default = _default;
});