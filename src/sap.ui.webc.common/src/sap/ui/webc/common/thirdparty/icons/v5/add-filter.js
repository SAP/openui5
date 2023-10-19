sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons", "../generated/i18n/i18n-defaults"], function (_exports, _Icons, _i18nDefaults) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "add-filter";
  const pathData = "M358 0q11 0 18.5 7.5T384 26q0 8-5 15L256 199v105q0 13-11 21l-77 54q-7 5-14 5-11 0-18.5-7.5T128 358V199L5 41q-5-7-5-15Q0 15 7.5 7.5T26 0h332zm-52 51H78l96 124q5 7 5 16v118l26-18V191q0-9 5-16zm180 323q11 0 18.5 7.5T512 400t-7.5 18.5T486 426h-60v60q0 11-7.5 18.5T400 512t-18.5-7.5T374 486v-60h-60q-11 0-18.5-7.5T288 400t7.5-18.5T314 374h60v-60q0-11 7.5-18.5T400 288t18.5 7.5T426 314v60h60z";
  _exports.pathData = pathData;
  const ltr = false;
  _exports.ltr = ltr;
  const accData = _i18nDefaults.ICON_ADD_FILTER;
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
  var _default = "SAP-icons-v5/add-filter";
  _exports.default = _default;
});