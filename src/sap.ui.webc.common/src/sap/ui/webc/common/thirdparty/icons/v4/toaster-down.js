sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "toaster-down";
  const pathData = "M0 48q0-16 16-16h480q16 0 16 16t-16 16h-16v224q0 26-19 45t-45 19v-32q14 0 23-9t9-23V64H64v224q0 14 9 23t23 9v32q-26 0-45-19t-19-45V64H16Q0 64 0 48zm132 329q5-5 11-5t11 5l85 85V239q0-16 16-16t16 16v225l87-87q5-5 11-5 7 0 12 5 11 11 0 23L279 501q-9 10-23 10-13 0-22-10L132 400q-12-12 0-23zM112 96h288q16 0 16 16 0 6-4.5 11t-11.5 5H112q-6 0-11-5t-5-11q0-7 5-11.5t11-4.5zm0 64h96q16 0 16 16 0 6-4.5 11t-11.5 5h-96q-6 0-11-5t-5-11q0-7 5-11.5t11-4.5z";
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
  var _default = "SAP-icons-v4/toaster-down";
  _exports.default = _default;
});