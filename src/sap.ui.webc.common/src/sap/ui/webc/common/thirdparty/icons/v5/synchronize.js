sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons", "../generated/i18n/i18n-defaults"], function (_exports, _Icons, _i18nDefaults) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "synchronize";
  const pathData = "M475 333q8 3 11.5 9.5T490 357q0 4-2 10-32 68-93.5 107T257 513q-60 0-113.5-27.5T52 409v46q0 11-7 18.5T27 481t-18.5-7.5T1 455v-99q0-11 7.5-18t18.5-7h98q11 0 18.5 7t7.5 18-7.5 18.5T125 382H97q29 38 71.5 59t88.5 21q60 0 109.5-31.5T441 345q5-9 15-13t19 1zm12-299q11 0 18.5 7.5T513 60v99q0 11-7.5 18t-18.5 7h-98q-11 0-18.5-7t-7.5-18 7.5-18.5T389 133h28q-30-38-72-59t-88-21q-61 0-110 31t-74 85q-3 8-9.5 11.5T50 184q-8 0-11-2-8-3-11.5-9.5T24 159q0-5 2-11 32-68 93.5-107.5T257 1q60 0 113.5 28t91.5 77V60q0-11 7-18.5t18-7.5z";
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
  var _default = "SAP-icons-v5/synchronize";
  _exports.default = _default;
});