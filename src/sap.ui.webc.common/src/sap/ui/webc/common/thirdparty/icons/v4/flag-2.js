sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons", "../generated/i18n/i18n-defaults"], function (_exports, _Icons, _i18nDefaults) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "flag-2";
  const pathData = "M63 0h33v512H63V0zm385 0v239q-13 13-30 25-8 5-15.5 9t-15.5 8q-17 7-35 7-3 0-9-1t-15-4l-85-23q-12-4-19-4-54 0-96 32V63q10-18 26-31t33-22q22-10 48-10 5 0 10.5 1T256 4q2 0 3 1h3l84 23q9 3 15.5 4t9.5 1h12.5l10.5-2q10-2 17-6h1l1-1 2-1 4-2 5-4h1l1-1zm-32 58l-15 5q-7 1-14.5 1.5T371 65q-5 0-11.5-1T337 59l-83-23-20-4q-21 0-32 7-8 4-15 8t-13 9q-8 8-14 17v161q1 0 2-1 27-9 62-9 8 0 32 6l97 26q11 0 24.5-6.5T400 238l16-13V58z";
  _exports.pathData = pathData;
  const ltr = true;
  _exports.ltr = ltr;
  const accData = _i18nDefaults.ICON_FLAG;
  _exports.accData = accData;
  const collection = "SAP-icons";
  const packageName = "@ui5/webcomponents-icons";
  (0, _Icons.registerIcon)(name, {
    pathData,
    ltr,
    accData,
    collection,
    packageName
  });
  var _default = "flag-2";
  _exports.default = _default;
});