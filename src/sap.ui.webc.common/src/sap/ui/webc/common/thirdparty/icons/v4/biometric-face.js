sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "biometric-face";
  const pathData = "M255 416q-37 0-67.5-17T135 352q-5-8-6-11t-1-5q0-16 16-16 4 0 8 2.5t11 12.5q16 23 40 36t53 13 53-13 40-36q7-9 11-11.5t8-2.5q16 0 16 16 0 2-1 5t-6 10q-20 26-50.5 45T255 416zm-39-128q-24 0-24-16t20-16q17 0 30.5-14t13.5-34v-64q0-16 16-16t16 16v64q0 16-6 31t-16.5 25.5-23 17T216 288zm-72-64q-16 0-16-16v-64q0-16 16-16t16 16v64q0 16-16 16zm224 0q-16 0-16-16v-64q0-16 16-16t16 16v64q0 16-16 16zm144-64h-32V48q0-16-16-16H352V0h112q20 0 34 14t14 34v112zm-48 352H352v-32h112q16 0 16-16V352h32v112q0 20-14 34t-34 14zM32 160H0V48q0-20 14-34T48 0h112v32H48q-16 0-16 16v112zm128 352H48q-20 0-34-14T0 464V352h32v112q0 16 16 16h112v32z";
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
  var _default = "SAP-icons-v4/biometric-face";
  _exports.default = _default;
});