sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons", "../generated/i18n/i18n-defaults"], function (_exports, _Icons, _i18nDefaults) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "flag";
  const pathData = "M422 64q11 0 18.5 7.5T448 90v236q0 14-13 22l-17 10q-47 26-96 26-31 0-53.5-10T220 347q-9-6-23.5-9.5T165 334q-15 0-24 3.5T115 352v134q0 11-7 18.5T90 512t-18.5-7.5T64 486V26q0-11 7.5-18.5T90 0t18 7.5 7 18.5v15q11-4 23-6.5t28-2.5q29 0 50 9t49 26q38 22 73 22 30 0 56-13l17-9q5-3 11-3z";
  _exports.pathData = pathData;
  const ltr = true;
  _exports.ltr = ltr;
  const accData = _i18nDefaults.ICON_FLAG;
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
  var _default = "SAP-icons-v5/flag";
  _exports.default = _default;
});