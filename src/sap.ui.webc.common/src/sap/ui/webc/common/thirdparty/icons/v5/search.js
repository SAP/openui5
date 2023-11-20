sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons", "../generated/i18n/i18n-defaults"], function (_exports, _Icons, _i18nDefaults) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "search";
  const pathData = "M473 436q7 7 7 18t-7.5 18.5T454 480q-10 0-18-8l-95-95q-51 39-117 39-40 0-75-15t-61-41-41-61-15-75 15-75 41-61 61-41 75-15 75 15 61 41 41 61 15 75q0 64-39 117zM83 224q0 30 11 55.5t30 44.5 44.5 30 55.5 11 55.5-11 44.5-30 30-44.5 11-55.5-11-55.5-30-44.5-44.5-30T224 83t-55.5 11-44.5 30-30 44.5T83 224z";
  _exports.pathData = pathData;
  const ltr = true;
  _exports.ltr = ltr;
  const accData = _i18nDefaults.ICON_SEARCH;
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
  var _default = "SAP-icons-v5/search";
  _exports.default = _default;
});