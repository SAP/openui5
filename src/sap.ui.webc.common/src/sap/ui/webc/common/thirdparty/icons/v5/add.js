sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons", "../generated/i18n/i18n-defaults"], function (_exports, _Icons, _i18nDefaults) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "add";
  const pathData = "M286 279v164q0 11-7.5 18.5T260 469q-10 0-18-8-8-6-8-18V279H70q-12 0-18-8-8-8-8-18 0-11 7.5-18.5T70 227h164V63q0-11 7.5-18.5T260 37t18.5 7.5T286 63v164h164q11 0 18.5 7.5T476 253t-7.5 18.5T450 279H286z";
  _exports.pathData = pathData;
  const ltr = false;
  _exports.ltr = ltr;
  const accData = _i18nDefaults.ICON_ADD;
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
  var _default = "add";
  _exports.default = _default;
});