sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "blocked";
  const pathData = "M256 0q53 0 99.5 20T437 75t55 81.5 20 99.5-20 100-55 81.5-81.5 54.5-99.5 20-100-20-81.5-54.5T20 356 0 256t20-99.5T74.5 75 156 20 256 0zm156 368q17-24 26.5-52t9.5-60q0-40-15-75t-41-61-61-41-75-15q-32 0-60 9.5T145 100zM64 256q0 40 15 75t41 61 61 41 75 15q31 0 59-9t52-26L99 145q-17 24-26 52t-9 59z";
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
  var _default = "blocked";
  _exports.default = _default;
});