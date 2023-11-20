sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "chart-axis";
  const pathData = "M487.5 408q9 10 9 23t-9 23l-61 53q-5 5-11 5t-11-5-5-11.5 5-11.5l44-36h-336q-14 0-23-9.5t-9-22.5V80l-37 43q-5 5-11.5 5t-11.5-5-5-11 5-11l52-60q10-9 23-9t23 9l53 60q5 5 5 11t-5 11-11.5 5-11.5-5l-36-43v313l225-225-57 5q-16-2-16-16 0-7 4.5-11.5t10.5-4.5l80-6q13 1 22.5 10t9.5 22l-5 81q0 6-4.5 10.5t-10.5 4.5q-17 0-17-16l5-56-224 225h313l-44-37q-5-5-5-11.5t5-11.5 11-5 11 5z";
  _exports.pathData = pathData;
  const ltr = false;
  _exports.ltr = ltr;
  const accData = null;
  _exports.accData = accData;
  const collection = "SAP-icons-v4";
  const packageName = "@ui5/webcomponents-icons";
  (0, _Icons.registerIcon)(name, {
    pathData,
    ltr,
    collection,
    packageName
  });
  var _default = "SAP-icons-v4/chart-axis";
  _exports.default = _default;
});