sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons", "../generated/i18n/i18n-defaults"], function (_exports, _Icons, _i18nDefaults) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "activate";
  const pathData = "M303.5 294l-200 201q-17 16-43 16t-43-16q-17-19-17-43t17-43l201-200 25-25q8-8 18-8 9 0 17 8l50 50q8 8 8 17 0 10-8 18zm-52-18l-15-15-184 183q-3 4-3 8t3 7q4 4 8 4t7-4zm80-150q-20-5-20-25 0-22 20-25l45-10 10-45q5-21 25-21t25 21l10 45 45 10q20 3 20 25 0 20-20 25l-45 10-10 45q-5 20-25 20t-25-20l-10-45zm-276 0q-20-5-20-25 0-22 20-25l45-10 10-45q5-21 25-21t25 21l10 45 45 10q21 3 21 25 0 20-21 25l-45 10-10 45q-5 20-25 20t-25-20l-10-45zm436 226q20 3 20 25 0 20-20 25l-45 10-10 45q-5 20-25 20t-25-20l-10-45-45-10q-20-5-20-25 0-22 20-25l45-10 10-46q5-20 25-20t25 20l10 46z";
  _exports.pathData = pathData;
  const ltr = false;
  _exports.ltr = ltr;
  const accData = _i18nDefaults.ICON_ACTIVATE;
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
  var _default = "activate";
  _exports.default = _default;
});