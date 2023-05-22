sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons", "../generated/i18n/i18n-defaults"], function (_exports, _Icons, _i18nDefaults) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "redo";
  const pathData = "M331.5 308q-8-8-8-18t8-18l60-60h-229q-33 0-55.5 22.5T84.5 290t22.5 55.5 55.5 22.5h98q12 0 19 7.5t7 18.5q0 26-26 26h-98q-27 0-51-10T70 382.5 42.5 341t-10-51 10-51T70 197.5t41.5-27.5 51-10h229l-60-59q-8-10-8-19 0-10 8-18t18-8 18 8l102 102q4 4 7 8t3 12q0 14-10 21l-102 101q-7 8-18 8t-18-8z";
  _exports.pathData = pathData;
  const ltr = false;
  _exports.ltr = ltr;
  const accData = _i18nDefaults.ICON_REDO;
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
  var _default = "SAP-icons-v5/redo";
  _exports.default = _default;
});