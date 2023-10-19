sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons", "../generated/i18n/i18n-defaults"], function (_exports, _Icons, _i18nDefaults) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "redo";
  const pathData = "M160 160h256l-88-84q-8-8-8-18 0-11 7.5-18.5T346 32q10 0 17 7l141 134q8 8 8 19 0 12-8 18L363 345q-7 7-17 7-11 0-18.5-7.5T320 326q0-10 8-18l101-97H160q-22 0-42 8.5T83 243t-23.5 34.5T51 320q0 22 8.5 42T83 397t35 23.5 42 8.5h198q11 0 18.5 7t7.5 18-7.5 18.5T358 480H160q-33 0-62-12.5T47 433t-34.5-51T0 320t12.5-62T47 207t51-34.5 62-12.5z";
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