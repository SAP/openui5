sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons", "../generated/i18n/i18n-defaults"], function (_exports, _Icons, _i18nDefaults) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "iphone-2";
  const pathData = "M435 64q33 0 55 22t22 55v240q-4 29-26 48t-51 19H78q-33 0-55-22.5T1 371V141q0-33 22-55t55-22h357zm0 333q12 0 19-7.5t7-18.5V141q0-26-26-26H78q-26 0-26 26v230q0 11 7 18.5t19 7.5h357z";
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
  var _default = "SAP-icons-v5/iphone-2";
  _exports.default = _default;
});