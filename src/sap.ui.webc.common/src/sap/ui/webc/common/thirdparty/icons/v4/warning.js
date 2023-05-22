sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "warning";
  const pathData = "M257 349q-9 0-13-3.5t-6-18.5L218 39q0-17 11-28t28-11q15 0 26.5 11T295 39l-19 288q-3 14-7 18t-12 4zm1 54q21 0 37 15.5t16 38.5q0 22-16 38.5T258 512q-24 0-40-16.5T202 457q0-23 16-38.5t40-15.5z";
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
  var _default = "SAP-icons-v4/warning";
  _exports.default = _default;
});