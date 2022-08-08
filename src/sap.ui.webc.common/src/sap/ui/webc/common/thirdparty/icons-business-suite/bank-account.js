sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "bank-account";
  const pathData = "M29 152v-38L257 0l227 114v38h-28v24H57v-24H29zm222 0h9q10-2 18.5-8.5t12-15T294 112q0-2-.5-8.5T284 87q-11-11-25-11-11 0-20.5 6.5T224 98t-5 18q0 2 .5 8.5T230 141q9 9 21 11zm-43 248q-13-13-16-37l35-4q3 18 20 29v-55q-50-17-50-58 0-20 15-36.5t35-16.5v-19h20v19q20 0 32 14.5t17 31.5l-35 4q-2-17-14-22v53q30 6 42 19.5t12 36.5q0 25-16 41-13 15-38 18v18h-20v-17q-26-3-39-19zM60 224h64v176H60V224zm336 0h64v176h-64V224zm-165 50q0 4 3.5 11t12.5 10v-46q-9 5-12.5 12t-3.5 13zm36 115q11-2 14-9 7-7 7-16 0-8-5-15.5T267 338v51zM29 464h455v48H29v-48z";
  _exports.pathData = pathData;
  const ltr = false;
  _exports.ltr = ltr;
  const accData = null;
  _exports.accData = accData;
  const collection = "business-suite";
  const packageName = "@ui5/webcomponents-icons-business-suite";
  (0, _Icons.registerIcon)(name, {
    pathData,
    ltr,
    collection,
    packageName
  });
  var _default = "bank-account";
  _exports.default = _default;
});