sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "letter";
  const pathData = "M422 64q38 0 64 26t26 64v204q0 38-26 64t-64 26H90q-38 0-64-26T0 358V154q0-38 26-64t64-26h332zm39 90q0-17-11-28t-28-11H90q-17 0-28 11t-11 28v204q0 17 11 28t28 11h332q17 0 28-11t11-28V154zm-71 6q11 0 18.5 7.5T416 186v44q0 11-7.5 18.5T390 256h-44q-11 0-18.5-7.5T320 230v-44q0-11 7.5-18.5T346 160h44zm-160 32q11 0 18.5 7.5T256 218t-7.5 18-18.5 7H122q-11 0-18.5-7T96 218t7.5-18.5T122 192h108zm-32 77q11 0 18.5 7.5T224 295t-7.5 18-18.5 7h-76q-11 0-18.5-7T96 295t7.5-18.5T122 269h76z";
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
  var _default = "SAP-icons-v5/letter";
  _exports.default = _default;
});