sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons", "../generated/i18n/i18n-defaults"], function (_exports, _Icons, _i18nDefaults) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "show";
  const pathData = "M256 448q-40 0-77.5-16T108 390.5 48 333 3 268q-3-6-3-12 0-8 3-12 18-33 45-65.5t60-58 70.5-41T256 64t77.5 15.5 70.5 41 60 58 45 65.5q3 4 3 12 0 6-3 12-18 33-45 65t-60 57.5-70.5 41.5-77.5 16zM56 256q9 13 27 37t44 47 58.5 40 70.5 17 70.5-17 58.5-40 44-47 27-37q-9-14-27-37.5T385 172t-58.5-40-70.5-17-70.5 17-58.5 40-44 46.5T56 256zm200 96q-41 0-68.5-27.5T160 256t27.5-68.5T256 160t68.5 27.5T352 256t-27.5 68.5T256 352zm0-141q-20 0-32.5 12.5T211 256t12.5 32.5T256 301t32.5-12.5T301 256t-12.5-32.5T256 211z";
  _exports.pathData = pathData;
  const ltr = false;
  _exports.ltr = ltr;
  const accData = _i18nDefaults.ICON_SHOW;
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
  var _default = "SAP-icons-v5/show";
  _exports.default = _default;
});