sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons", "../generated/i18n/i18n-defaults"], function (_exports, _Icons, _i18nDefaults) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "iphone-2";
  const pathData = "M435 64q33 0 55 22t22 55v214q-4 29-26 48t-51 19H78q-33 0-55-22.5T1 345V141q0-33 22-55t55-22h357zm0 307q12 0 19-7.5t7-18.5v-15q0-16-15-23l-23-11q-6-4-11-9.5t-5-13.5v-51q0-16 16-23l23-10q5-4 10-9.5t5-13.5v-25q0-26-26-26H78q-26 0-26 26v204q0 11 7 18.5t19 7.5h357z";
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
  var _default = "iphone-2";
  _exports.default = _default;
});