sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "bank-account";
  const pathData = "M57 152H29v-38L257 0l227 114v38h-28v24H57v-24zm194 0h9c22-4 34-24 34-40 0-3 2-12-10-25-7-7-16-11-25-11-23 0-40 23-40 40 0 3-2 12 11 25 6 6 13 10 21 11zm-43 248c-9-9-14-21-16-37l35-4c2 12 9 22 20 29v-55c-33-11-50-31-50-58s23-53 50-53v-19h20v19c27 0 42 23 49 46l-35 4c-1-11-6-19-14-22v53c40 8 54 25 54 56 0 17-5 30-16 41-9 10-21 16-38 18v18h-20v-17c-17-2-30-8-39-19zm-148 0V224h64v176H60zm336 0V224h64v176h-64zM231 274c0 5 4 17 16 21v-46c-12 7-16 17-16 25zm36 64v51c7-1 12-4 14-9 5-5 7-10 7-16 0-11-6-22-21-26zM29 512v-48h455v48H29z";
  _exports.pathData = pathData;
  const ltr = false;
  _exports.ltr = ltr;
  const accData = null;
  _exports.accData = accData;
  const collection = "business-suite-v1";
  const packageName = "@ui5/webcomponents-icons-business-suite";
  (0, _Icons.registerIcon)(name, {
    pathData,
    ltr,
    collection,
    packageName
  });
  var _default = "business-suite-v1/bank-account";
  _exports.default = _default;
});