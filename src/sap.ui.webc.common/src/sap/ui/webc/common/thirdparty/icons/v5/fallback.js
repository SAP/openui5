sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "fallback";
  const pathData = "M422 480H90q-38 0-64-26T0 390V122q0-38 26-64t64-26h115q9 0 18 7l44 44h155q38 0 64 26t26 63v26q0 11-7.5 18.5T486 224t-18-7.5-7-18.5v-26q0-16-11-27t-28-11H256q-9 0-18-7l-44-44H90q-17 0-28 11t-11 28v268q0 17 11 28t28 11h332q17 0 28-11t11-28v-13q0-29-21-50t-50-21H214l34 34q8 8 8 18 0 11-7.5 18.5T230 384q-10 0-18-8l-77-76q-7-8-7-19t7-18l77-77q9-7 18-7 11 0 18.5 7.5T256 205q0 10-8 18l-32 32h174q26 0 48 9.5t38.5 26 26 39T512 377v13q0 38-26 64t-64 26z";
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
  var _default = "SAP-icons-v5/fallback";
  _exports.default = _default;
});