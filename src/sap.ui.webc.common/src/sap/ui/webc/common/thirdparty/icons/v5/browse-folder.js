sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "browse-folder";
  const pathData = "M166 429q11 0 18.5 7t7.5 18-7.5 18.5T166 480H90q-38 0-64-26T0 390V122q0-38 26-64t64-26h115q9 0 18 7l44 38h155q38 0 64 26t26 63v96q0 11-7.5 18.5T486 288t-18-7.5-7-18.5v-96q0-16-11-27t-28-11H256q-9 0-18-7l-44-38H90q-17 0-28 11t-11 28v268q0 17 11 28t28 11h76zm339 39q7 7 7 18t-7.5 18.5T486 512t-18-7L363 399q-28 17-59 17-22 0-42.5-9t-36-24.5-24.5-36-9-42.5q0-23 9-43.5t24-35.5 35.5-24 43.5-9 43.5 9 35.5 24 24 35.5 9 43.5q0 31-17 59zM304 365q24 0 42.5-18t18.5-43q0-23-17.5-42T304 243t-43 19-17 42q0 25 18 43t42 18z";
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
  var _default = "SAP-icons-v5/browse-folder";
  _exports.default = _default;
});