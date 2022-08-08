sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "picture";
  const pathData = "M163 107q-17 0-28.5 11.5T123 147t11.5 28.5T163 187t28.5-11.5T203 147t-11.5-28.5T163 107zM416 1q34 0 57 22.5T496 81v319q0 34-23 57t-57 23H97q-35 0-57.5-23T17 400V81q0-35 22.5-57.5T97 1h319zM97 54q-12 0-20 7.5T67 81v309l115-115q11-8 20-8 6 0 12 3l34 18 94-93q10-8 20-8 6 0 12 3l69 34V81q0-12-7.5-19.5T416 54H97zm319 373q11 0 17.5-6t7.5-14q0-1-1-1V286l-74-38-67 67 21 11q13 6 13 23 0 5-2 11-6 13-21 13-9 0-14-2l-87-45-102 101h309z";
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
  var _default = "picture";
  _exports.default = _default;
});