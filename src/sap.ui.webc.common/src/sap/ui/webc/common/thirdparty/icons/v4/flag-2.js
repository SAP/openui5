sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons", "../generated/i18n/i18n-defaults"], function (_exports, _Icons, _i18nDefaults) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "flag-2";
  const pathData = "M64 0h32v512H64V0zm384 0v239q-13 13-30 25-8 5-15.5 9t-15.5 8q-17 7-35 7-3 0-9-1t-15-4l-80-22h-2q-1-1-3-1-12-4-19-4-29 0-51 8-22 7-45 24V63q8-15 26-31 12-11 33-22 22-10 48-10 5 0 10 1t10 3q3 0 4 1h3l84 23q9 3 15.5 4t9.5 1h12.5l10.5-2q10-2 17-6h1l1-1q1 0 1-1h1q2-2 4-2l5-4h1l1-1zm-32 58l-15 5q-7 1-14.5 1.5T371 65q-5 0-11.5-.5T337 59l-83-23-20-4q-21 0-32 7-15 7-28 18-7 6-14 16v161q1 0 2-1 27-9 62-9 8 0 32 6l97 26q12 0 21-5 7-3 13.5-6t12.5-7l16-12V58z";
  _exports.pathData = pathData;
  const ltr = true;
  _exports.ltr = ltr;
  const accData = _i18nDefaults.ICON_FLAG;
  _exports.accData = accData;
  const collection = "SAP-icons-v4";
  const packageName = "@ui5/webcomponents-icons";
  (0, _Icons.registerIcon)(name, {
    pathData,
    ltr,
    accData,
    collection,
    packageName
  });
  var _default = "SAP-icons-v4/flag-2";
  _exports.default = _default;
});