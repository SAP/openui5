sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons", "../generated/i18n/i18n-defaults"], function (_exports, _Icons, _i18nDefaults) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "iphone-2";
  const pathData = "M448 96q26 0 45 18.5t19 45.5v192q0 26-19 45t-45 19H64q-26 0-45-19T0 352V160q0-27 19-45.5T64 96h384zM56 280q10 0 17-7t7-17-7-17-17-7-17 7-7 17 7 17 17 7zm392-152H96v256h352V128z";
  _exports.pathData = pathData;
  const ltr = false;
  _exports.ltr = ltr;
  const accData = _i18nDefaults.ICON_IPHONE;
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
  var _default = "SAP-icons-v4/iphone-2";
  _exports.default = _default;
});