sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons", "../generated/i18n/i18n-defaults"], function (_exports, _Icons, _i18nDefaults) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "refresh";
  const pathData = "M307 179q0-11 7.5-18t18.5-7h101q-27-48-75-75.5T255 51q-42 0-79.5 16t-65 43.5-43.5 65T51 256t16 80 44 65 65 44 80 16q35 0 67-11.5t58.5-31.5 45.5-48.5 28-62.5q2-8 9.5-13.5T480 288q11 0 18.5 7.5T506 314q0 2-.5 3.5L504 322q-10 42-34 76.5t-57 60-73 39.5-84 14q-53 0-100-20t-81.5-54.5T20 356 0 256t20-100 54.5-81.5 81-54.5T255 0q61 0 115.5 26.5T461 101V26q0-11 7-18.5T486 0t18.5 7.5T512 26v153q0 11-7.5 18.5T486 205H333q-11 0-18.5-7.5T307 179z";
  _exports.pathData = pathData;
  const ltr = false;
  _exports.ltr = ltr;
  const accData = _i18nDefaults.ICON_REFRESH;
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
  var _default = "SAP-icons-v5/refresh";
  _exports.default = _default;
});