sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons", "../generated/i18n/i18n-defaults"], function (_exports, _Icons, _i18nDefaults) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "iphone";
  const pathData = "M346 512H166q-29 0-49.5-22.5T96 435V77q0-32 20.5-54.5T166 0h180q29 0 49.5 22.5T416 77v358q0 32-20.5 54.5T346 512zM166 51q-8 0-13.5 7.5T147 77v358q0 11 5.5 18.5T166 461h180q8 0 13.5-7.5T365 435V77q0-11-5.5-18.5T346 51H166z";
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
  var _default = "SAP-icons-v5/iphone";
  _exports.default = _default;
});