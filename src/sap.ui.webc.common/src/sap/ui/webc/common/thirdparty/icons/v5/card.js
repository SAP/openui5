sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "card";
  const pathData = "M379 345q2 3 2 11 1 0 1 .5t-1 .5v2q0 5-3 11-9 12-22 12H156q-12 0-20-10-6-8-6-16 0-2 1-3v-3l25-100q3-16 20-19h5q13 0 20 10l61 81 55-37q5-4 13-4 5 0 7 1 12 2 17 13zm-43-127q-17 0-29.5-12.5T294 176t12.5-29 29.5-12 29 12 12 29-12 29.5-29 12.5zm69-186q31 0 53 22t22 53v298q0 32-22 53.5T405 480H107q-31 0-53-21.5T32 405V107q0-31 22-53t53-22h298zm24 75q0-10-7-17t-17-7H107q-10 0-17 7t-7 17v298q0 10 7 17t17 7h298q10 0 17-7t7-17V107z";
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
  var _default = "SAP-icons-v5/card";
  _exports.default = _default;
});