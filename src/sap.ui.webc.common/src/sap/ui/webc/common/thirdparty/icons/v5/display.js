sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons", "../generated/i18n/i18n-defaults"], function (_exports, _Icons, _i18nDefaults) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "display";
  const pathData = "M505 298q3 9 5 18.5t2 20.5q0 22-9 42.5T479 415t-35 24-43 9q-22 0-42.5-8.5t-36-23-25-33.5-9.5-40q0-22-9-32.5T256 300t-23 10.5-9 32.5q0 21-9.5 40t-25 33.5-36 23T111 448t-42.5-9T33 415 9 379.5 0 336q0-18 6-36l59-195q5-19 20-30t35-11h46q11 0 18.5 7.5T192 90t-7.5 18-18.5 7h-46q-4 0-6 5L81 228q8-2 15.5-3t15.5-1q26 0 49.5 11.5T201 269q23-20 55-20t55 20q16-22 39.5-33.5T400 224q8 0 15.5 1t15.5 3l-33-108q-2-5-6-5h-46q-11 0-18.5-7T320 90t7.5-18.5T346 64h46q19 0 34.5 11t20.5 30zm-393 99q25 0 43-18t18-43-18-43-43-18-43 18-18 43 18 43 43 18zm288 0q25 0 43-18t18-43-18-43-43-18-43 18-18 43 18 43 43 18z";
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
  var _default = "SAP-icons-v5/display";
  _exports.default = _default;
});