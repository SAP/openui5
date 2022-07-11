sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons", "../generated/i18n/i18n-defaults"], function (_exports, _Icons, _i18nDefaults) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "iphone";
  const pathData = "M360.917 1q32 0 54 22t20 54v358q0 32-22 54.5t-55 22.5h-204q-32 0-54.5-22.5t-22.5-54.5V77q0-32 22.5-54t54.5-22h207zm26 76q0-11-7.5-18t-18.5-7h-20q-8 0-13.5 4.5t-9.5 10.5l-11 23q-7 15-23 15h-51q-8 0-13.5-4.5t-9.5-10.5l-10-23q-7-15-23-15h-20q-26 0-26 25v358q0 11 7 18.5t19 7.5h204q11 0 18.5-7.5t7.5-18.5V77z";
  _exports.pathData = pathData;
  const ltr = false;
  _exports.ltr = ltr;
  const accData = _i18nDefaults.ICON_IPHONE;
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
  var _default = "iphone";
  _exports.default = _default;
});