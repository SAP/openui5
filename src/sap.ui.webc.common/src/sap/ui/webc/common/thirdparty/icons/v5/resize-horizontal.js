sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons", "../generated/i18n/i18n-defaults"], function (_exports, _Icons, _i18nDefaults) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "resize-horizontal";
  const pathData = "M205 20q11 0 18.5 7t7.5 18v409q0 11-7.5 18.5T205 480t-18.5-7.5T179 454V45q0-11 7.5-18t18.5-7zm102 0q26 0 26 25v409q0 11-7 18.5t-19 7.5q-11 0-18-7.5t-7-18.5V45q0-25 25-25zM121 155q8 8 8 18t-8 18l-59 59 59 58q8 8 8 18t-8 18-18 8-18-8L8 268q-8-8-8-18t8-18l77-77q8-8 18-8t18 8zm383 77q8 8 8 18t-8 18l-77 76q-8 8-18 8t-18-8-8-18 8-18l59-58-59-59q-8-8-8-18t8-18 18-8 18 8z";
  _exports.pathData = pathData;
  const ltr = false;
  _exports.ltr = ltr;
  const accData = _i18nDefaults.ICON_RESIZE_HORIZONTAL;
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
  var _default = "resize-horizontal";
  _exports.default = _default;
});