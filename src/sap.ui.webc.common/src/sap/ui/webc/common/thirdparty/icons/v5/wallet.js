sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "wallet";
  const pathData = "M422 32q24 0 41 17t17 41v332q0 24-17 41t-41 17H90q-24 0-41-17t-17-41V90q0-24 17-41t41-17h332zm0 397q7 0 7-7v-38H282q-38 0-64-26t-26-64v-76q0-38 26-64t64-26h147V90q0-7-7-7H90q-7 0-7 7v332q0 7 7 7h332zm7-250H282q-17 0-28 11t-11 28v76q0 17 11 28t28 11h147V179zM320 288q-13 0-22.5-9.5T288 256t9.5-22.5T320 224t22.5 9.5T352 256t-9.5 22.5T320 288z";
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
  var _default = "SAP-icons-v5/wallet";
  _exports.default = _default;
});