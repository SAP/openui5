sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons", "../generated/i18n/i18n-defaults"], function (_exports, _Icons, _i18nDefaults) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "full-screen";
  const pathData = "M461 10q11 0 18 7.5t7 18.5v128q0 11-7 18t-18 7-18.5-7-7.5-18V98l-70 70q-7 7-18 7t-18.5-7-7.5-18q0-10 8-18l70-71h-66q-11 0-18.5-7T307 36t7.5-18.5T333 10h128zM205 61q11 0 18.5 7.5T231 87t-7.5 18-18.5 7h-76v77q0 11-7.5 18.5T103 215t-18.5-7.5T77 189V87q0-11 7.5-18.5T103 61h102zm205 205q11 0 18 7t7 18v103q0 11-7 18t-18 7H307q-11 0-18-7t-7-18 7-18.5 18-7.5h77v-77q0-11 7.5-18t18.5-7zM180 419q11 0 18 7.5t7 18.5-7 18-18 7H52q-11 0-18.5-7T26 445V317q0-11 7.5-18.5T52 291t18 7.5 7 18.5v66l71-70q8-8 18-8 11 0 18 7.5t7 18.5-7 18l-70 70h66z";
  _exports.pathData = pathData;
  const ltr = false;
  _exports.ltr = ltr;
  const accData = _i18nDefaults.ICON_FULL_SCREEN;
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
  var _default = "full-screen";
  _exports.default = _default;
});