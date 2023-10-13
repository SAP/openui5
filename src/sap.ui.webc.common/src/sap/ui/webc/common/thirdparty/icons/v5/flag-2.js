sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons", "../generated/i18n/i18n-defaults"], function (_exports, _Icons, _i18nDefaults) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "flag-2";
  const pathData = "M422 64q11 0 18.5 7.5T448 90v236q0 14-15.5 24.5t-36.5 18-41.5 11.5-30.5 4q-32 0-55-10t-49-27q-19-13-47-13-29 0-58 18v134q0 11-7 18.5T90 512t-18.5-7.5T64 486V26q0-11 7.5-18.5T90 0t18 7.5 7 18.5v15q11-4 23-6.5t27-2.5q22 0 41.5 6T248 57q33 19 50.5 25.5T335 89q34 0 57-13l6-3 12-6 12-3zm-25 66q-15 6-28.5 8t-25.5 2h-13q-27 0-50-8.5T239 111q-28-17-42.5-22.5T167 83q-28 0-52 15v196q30-12 59-12 41 0 75 23l14 9q14 10 29.5 14t30.5 4q19 0 38-5.5t36-15.5V130z";
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
  var _default = "SAP-icons-v5/flag-2";
  _exports.default = _default;
});