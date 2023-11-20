sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "ui-notifications";
  const pathData = "M422 64q38 0 64 26t26 64v204q0 38-26 64t-64 26H90q-38 0-64-26T0 358V154q0-38 26-64t64-26h332zm39 90q0-17-11-28t-28-11H90q-17 0-28 11t-11 28v204q0 17 11 28t28 11h332q17 0 28-11t11-28V154zm-103 19q11 0 18.5 7t7.5 18-7.5 18.5T358 224H154q-11 0-18.5-7.5T128 198t7.5-18 18.5-7h204zm-96 115q11 0 18.5 7.5T288 314t-7.5 18-18.5 7H154q-11 0-18.5-7t-7.5-18 7.5-18.5T154 288h108z";
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
  var _default = "SAP-icons-v5/ui-notifications";
  _exports.default = _default;
});