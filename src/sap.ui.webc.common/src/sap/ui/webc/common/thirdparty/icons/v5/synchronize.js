sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons", "../generated/i18n/i18n-defaults"], function (_exports, _Icons, _i18nDefaults) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "synchronize";
  const pathData = "M447 87l1-23q0-14 9-23t23-9 22.5 9 9.5 23v96q0 14-9 23t-23 9h-97q-14 0-23-8.5t-9-22.5 9-23 23-9h24l-21-17q-26-21-58.5-34.5T259 64q-58 0-104.5 30.5T86 173q-5 12-17 16.5t-24-.5q-17-5-22-17.5t3-24.5q31-65 91.5-105.5T256 1q48 0 92 19t80 51zM65 425l-1 23q0 14-9 23t-23 9-22.5-9T1 448v-96q-1-14 8-23t23-9h97q14 0 23 8.5t9 22.5-9 23-23 9l-24 1 21 16q26 21 58.5 34.5T253 448q58 0 104.5-30.5T426 339q5-12 17-16.5t24 .5q17 5 22 17.5t-3 24.5q-31 65-91.5 105.5T257 511q-48 0-92.5-19T84 441z";
  _exports.pathData = pathData;
  const ltr = false;
  _exports.ltr = ltr;
  const accData = _i18nDefaults.ICON_SYNCHRONIZE;
  _exports.accData = accData;
  const collection = "SAP-icons-v5";
  const packageName = "@ui5/webcomponents-icons";
  (0, _Icons.registerIcon)(name, {
    pathData,
    ltr,
    accData,
    collection,
    packageName
  });
  var _default = "synchronize";
  _exports.default = _default;
});