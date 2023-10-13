sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons", "../generated/i18n/i18n-defaults"], function (_exports, _Icons, _i18nDefaults) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "synchronize";
  const pathData = "M26 192q-11 0-18.5-7.5T0 166q0-2 1-6t5-12q17-33 42.5-60.5t58-47 70-30T254 0q60 0 113.5 23.5T461 90V58q0-11 7-18.5t18-7.5 18.5 7.5T512 58v108q0 11-7.5 18.5T486 192H378q-11 0-18.5-7.5T352 166t7.5-18 18.5-7h59q-33-43-81-66.5T254 51q-66 0-121 34t-84 93q-8 14-23 14zm460 128q11 0 18.5 7.5T512 346q0 2-1 6t-5 12q-16 33-42.5 60.5t-59 47-70 30T258 512q-60 0-113.5-23.5T51 422v32q0 11-7 18.5T26 480t-18.5-7.5T0 454V346q0-11 7.5-18.5T26 320h108q11 0 18.5 7.5T160 346t-7.5 18-18.5 7H75q33 43 81 66.5T258 461q66 0 121-34t84-93q8-14 23-14z";
  _exports.pathData = pathData;
  const ltr = false;
  _exports.ltr = ltr;
  const accData = _i18nDefaults.ICON_SYNCHRONIZE;
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
  var _default = "SAP-icons-v5/synchronize";
  _exports.default = _default;
});