sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "picture";
  const pathData = "M168 208q17 0 28.5-11.5T208 168t-11.5-28.5T168 128t-28.5 11.5T128 168t11.5 28.5T168 208zM405 32q31 0 53 22t22 53v298q0 31-22 53t-53 22H107q-31 0-53-22t-22-53V107q0-31 22-53t53-22h298zM107 83q-10 0-17 7t-7 17v286l91-91q8-8 18-8 5 0 13 4l40 23 89-90q9-7 18-7 7 0 11 3l66 32V107q0-10-7-17t-17-7H107zm298 346q10 0 17-7t7-17v-88l-72-36-67 66 17 10q13 7 13 23 0 6-3 12-7 13-23 13-7 0-12-3l-86-50-77 77h286z";
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
  var _default = "SAP-icons-v5/picture";
  _exports.default = _default;
});