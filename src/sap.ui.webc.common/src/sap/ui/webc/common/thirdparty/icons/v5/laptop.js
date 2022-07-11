sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons", "../generated/i18n/i18n-defaults"], function (_exports, _Icons, _i18nDefaults) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "laptop";
  const pathData = "M494 405q21 0 21 21t-21 21H24q-9 0-15-5.5T3 426t6-15.5 15-5.5h26q0-2-1-3v-1q-3-9-3-18V170q0-27 18-45.5t46-18.5h298q28 0 46 18.5t18 45.5v213q0 11-4 22h26zM88 383h342V170q0-21-22-21H110q-22 0-22 21v213z";
  _exports.pathData = pathData;
  const ltr = false;
  _exports.ltr = ltr;
  const accData = _i18nDefaults.ICON_LAPTOP;
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
  var _default = "laptop";
  _exports.default = _default;
});