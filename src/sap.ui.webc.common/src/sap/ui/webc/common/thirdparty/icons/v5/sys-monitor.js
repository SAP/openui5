sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "sys-monitor";
  const pathData = "M422 0q38 0 64 26t26 64v204q0 38-26 64t-64 26H320v77h70q11 0 18.5 7t7.5 18-7.5 18.5T390 512H121q-11 0-18-7.5T96 486t7-18 18-7h71v-77H90q-38 0-64-26T0 294V90q0-38 26-64T90 0h332zm39 90q0-17-11-28t-28-11H90q-17 0-28 11T51 90v204q0 17 11 28t28 11h332q17 0 28-11t11-28V90zM269 384h-26v77h26v-77z";
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
  var _default = "SAP-icons-v5/sys-monitor";
  _exports.default = _default;
});