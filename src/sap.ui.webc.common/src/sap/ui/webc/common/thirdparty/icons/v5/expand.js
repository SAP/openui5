sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons", "../generated/i18n/i18n-defaults"], function (_exports, _Icons, _i18nDefaults) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "expand";
  const pathData = "M256 32q11 0 19 8l134 141q7 7 7 17 0 11-7.5 18.5T390 224q-10 0-18-8L256 95 140 216q-8 8-18 8-11 0-18.5-7.5T96 198q0-10 7-17L238 40q6-8 18-8zm134 256q11 0 18.5 7.5T416 314q0 10-7 17L275 472q-8 8-19 8-12 0-18-8L103 331q-7-7-7-17 0-11 7.5-18.5T122 288q10 0 18 8l116 121 116-121q8-8 18-8z";
  _exports.pathData = pathData;
  const ltr = false;
  _exports.ltr = ltr;
  const accData = _i18nDefaults.ICON_EXPAND;
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
  var _default = "SAP-icons-v5/expand";
  _exports.default = _default;
});