sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "background";
  const pathData = "M168 208q17 0 28.5-12t11.5-28q0-17-11.5-28.5T168 128t-28.5 11.5T128 168q0 16 11.5 28t28.5 12zM405 32q31 0 53 22t22 53v298q0 31-22 53t-53 22H107q-31 0-53-22t-22-53V107q0-31 22-53t53-22h298zM107 83q-10 0-17 7t-7 17v285l91-90q14-14 31-4l40 23 89-90q14-12 29-4l66 32V107q0-10-7-17t-17-7H107zm298 346q10 0 17-7t7-17v-89l-72-35-67 66 17 10q10 5 12.5 15.5T317 392q-6 9-16 11.5t-19-2.5l-86-49-77 77h286z";
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
  var _default = "SAP-icons-v5/background";
  _exports.default = _default;
});