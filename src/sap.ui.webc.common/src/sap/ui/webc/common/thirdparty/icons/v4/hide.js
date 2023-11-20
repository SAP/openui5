sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons", "../generated/i18n/i18n-defaults"], function (_exports, _Icons, _i18nDefaults) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "hide";
  const pathData = "M23 0l489 490-22 22L0 23zm154 109q20-6 39.5-9.5T256 96q36 0 72.5 10t70 30 63 49.5T512 255q-17 32-39 57t-48 45l-23-23q21-16 40-35.5t33-43.5q-37-60-95-93.5T256 128q-14 0-27 2t-26 5zm-90 46l23 23q-42 30-73 78 38 60 95 94t123 34q14 0 27.5-2t26.5-5l26 26q-20 6-39.5 9.5T256 416h-1q-36 0-72-10t-69.5-30T51 326 0 256q35-62 87-101zm77 77l117 117q-12 3-25 3-40 0-68-28t-28-68q0-17 4-24zm68-68q7-4 24-4 40 0 68 28t28 68q0 13-3 25l-43-42q14-8 14-22 0-11-7-18t-17-7q-14 0-22 14z";
  _exports.pathData = pathData;
  const ltr = false;
  _exports.ltr = ltr;
  const accData = _i18nDefaults.ICON_HIDE;
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
  var _default = "SAP-icons-v4/hide";
  _exports.default = _default;
});