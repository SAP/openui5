sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons", "../generated/i18n/i18n-defaults"], function (_exports, _Icons, _i18nDefaults) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "overflow";
  const pathData = "M57.5 205q23 0 40 17t17 40q0 24-17 40.5t-40 16.5q-24 0-40.5-16.5T.5 262q0-23 16.5-40t40.5-17zm397 0q24 0 40.5 17t16.5 40q0 24-16.5 40.5T454.5 319q-23 0-40-16.5t-17-40.5q0-23 17-40t40-17zm-199 0q24 0 40.5 17t16.5 40q0 24-16.5 40.5T255.5 319q-23 0-39.5-16.5T199.5 262q0-23 16.5-40t39.5-17z";
  _exports.pathData = pathData;
  const ltr = false;
  _exports.ltr = ltr;
  const accData = _i18nDefaults.ICON_OVERFLOW;
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
  var _default = "overflow";
  _exports.default = _default;
});