sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "toaster-top";
  const pathData = "M0 48q0-6 4.5-11T16 32h480q7 0 11.5 5t4.5 11q0 16-16 16h-16v256q0 27-19 45.5T416 384H96q-26 0-45-18.5T32 320V64H16Q0 64 0 48zm64 272q0 14 9 23t23 9h320q14 0 23-9t9-23V64H64v256zm32 0q0-35 6.5-54.5T121 237t30-11 41-2q-26 0-45-18.5T128 160q0-26 19-45t45-19 45 19 19 45q0 27-19 45.5T192 224q23 0 41 2t30 11 18.5 28.5T288 320H96zm208-160h96q16 0 16 16 0 6-4.5 11t-11.5 5h-96q-6 0-11-5t-5-11q0-7 5-11.5t11-4.5zm0-64h96q16 0 16 16 0 6-4.5 11t-11.5 5h-96q-6 0-11-5t-5-11q0-7 5-11.5t11-4.5z";
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
  var _default = "SAP-icons-v4/toaster-top";
  _exports.default = _default;
});