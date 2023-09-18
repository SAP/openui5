sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons", "../generated/i18n/i18n-defaults"], function (_exports, _Icons, _i18nDefaults) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "drill-down";
  const pathData = "M256 192q-11 0-19-8L135 75q-7-7-7-17 0-11 7.5-18.5T154 32q10 0 18 8l84 89 84-89q8-8 18-8 11 0 18.5 7.5T384 58q0 10-7 17L275 184q-8 8-19 8zm0 144q-11 0-19-8L135 219q-7-7-7-17 0-11 7.5-18.5T154 176q10 0 18 8l84 89 84-89q8-8 18-8 11 0 18.5 7.5T384 202q0 10-7 17L275 328q-8 8-19 8zm0 144q-11 0-19-8L135 363q-7-7-7-17 0-11 7.5-18.5T154 320q10 0 18 8l84 89 84-89q8-8 18-8 11 0 18.5 7.5T384 346q0 10-7 17L275 472q-8 8-19 8z";
  _exports.pathData = pathData;
  const ltr = false;
  _exports.ltr = ltr;
  const accData = _i18nDefaults.ICON_DRILL_DOWN;
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
  var _default = "SAP-icons-v5/drill-down";
  _exports.default = _default;
});