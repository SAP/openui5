sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "inspect";
  const pathData = "M486 0q11 0 18.5 7.5T512 26v332q0 11-7.5 18.5T486 384H154q-11 0-18.5-7.5T128 358V26q0-11 7.5-18.5T154 0h332zm0 461q11 0 18.5 7t7.5 18-7.5 18.5T486 512H26q-11 0-18.5-7.5T0 486V26Q0 15 7.5 7.5T26 0t18 7.5T51 26v435h435zM461 51H179v282h282V51zM250 288q-11 0-18.5-7.5T224 262q0-10 8-18l97-97h-47q-11 0-18.5-7t-7.5-18 7.5-18.5T282 96h108q11 0 18.5 7.5T416 122v108q0 11-7.5 18.5T390 256t-18-7.5-7-18.5v-47l-97 97q-8 8-18 8z";
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
  var _default = "SAP-icons-v5/inspect";
  _exports.default = _default;
});