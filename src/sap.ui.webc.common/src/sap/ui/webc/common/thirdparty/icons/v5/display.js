sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons", "../generated/i18n/i18n-defaults"], function (_exports, _Icons, _i18nDefaults) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "display";
  const pathData = "M104 418q-22 0-41-8t-33-22.5T7.5 354-1 314q0-20 7-37.5T25 245l57-114q19-38 62-38h20q19 0 31.5 12.5T208 137v2q0 10-6.5 16.5T185 162t-16.5-6.5T162 139h-18q-14 0-21 13l-29 58q2 0 4.5-.5t5.5-.5q25 0 46.5 11t35.5 30q20-18 46-18h46q26 0 46 18 14-19 35.5-30t46.5-11q2 0 4.5.5t5.5.5l-29-58q-6-13-21-13h-18q0 10-6.5 16.5T325 162t-16.5-6.5T302 139v-2q0-19 12.5-31.5T346 93h20q20 0 36.5 10t25.5 28l57 114q12 14 19 31.5t7 37.5q0 21-8 40t-22.5 33.5T447 410t-41 8-41-8-33-22.5-22-33.5-8-40v-12q0-10-7-16.5t-17-6.5h-46q-10 0-17 6.5t-7 16.5v12q0 21-8 40t-22.5 33.5T144 410t-40 8zm302-46q24 0 41-17t17-41-17-41-41-17-41 17-17 41 17 41 41 17zm-244-58q0-24-17-41t-41-17-41 17-17 41 17 41 41 17 41-17 17-41z";
  _exports.pathData = pathData;
  const ltr = false;
  _exports.ltr = ltr;
  const accData = _i18nDefaults.ICON_DISPLAY;
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
  var _default = "display";
  _exports.default = _default;
});