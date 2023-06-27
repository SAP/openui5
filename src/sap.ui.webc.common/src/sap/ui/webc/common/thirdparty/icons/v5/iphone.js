sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons", "../generated/i18n/i18n-defaults"], function (_exports, _Icons, _i18nDefaults) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "iphone";
  const pathData = "M373.5 0q33 0 54 22.5t21 55.5v356q0 33-22.5 55.5T370.5 512h-229q-33 0-55.5-22.5T63.5 434V78q0-33 22.5-55.5T141.5 0h232zm26 78q0-11-7.5-18.5T373.5 52h-229q-12 0-19 7.5t-7 18.5v356q0 11 7 18.5t19 7.5h229q11 0 18.5-7.5t7.5-18.5V78z";
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