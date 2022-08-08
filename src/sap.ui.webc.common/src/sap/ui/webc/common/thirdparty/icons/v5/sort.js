sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons", "../generated/i18n/i18n-defaults"], function (_exports, _Icons, _i18nDefaults) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "sort";
  const pathData = "M64 358l34 34V58q0-26 26-26 11 0 18.5 7t7.5 19v334l33-34q8-7 19-7 10 0 18 7 7 8 7 18 0 11-7 19l-78 77q-8 8-18 8t-18-8l-78-77q-8-10-8-19 0-8 8-18 7-7 18-7t18 7zm265-202q-7 8-18 8t-18-8q-8-8-8-18t8-18l78-77q7-8 18-8t18 8l77 77q8 7 8 18t-8 18q-7 8-18 8t-18-8l-33-33v331q0 11-7.5 18.5T389 480q-12 0-19-7.5t-7-18.5V123z";
  _exports.pathData = pathData;
  const ltr = false;
  _exports.ltr = ltr;
  const accData = _i18nDefaults.ICON_SORT;
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
  var _default = "sort";
  _exports.default = _default;
});