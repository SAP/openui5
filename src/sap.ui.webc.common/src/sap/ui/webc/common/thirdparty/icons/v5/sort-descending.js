sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons", "../generated/i18n/i18n-defaults"], function (_exports, _Icons, _i18nDefaults) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "sort-descending";
  const pathData = "M182 351q7-7 17-7 11 0 18.5 7.5T225 370q0 10-8 18l-87 85q-7 7-17 7-11 0-18-7L8 388q-8-8-8-18 0-11 7.5-18.5T26 344t18 7l43 43V58q0-11 7.5-18.5T113 32t18 7.5 7 18.5v336zM486 64q11 0 18.5 7.5T512 90t-7.5 18-18.5 7H282q-11 0-18.5-7T256 90t7.5-18.5T282 64h204zm-64 128q11 0 18.5 7.5T448 218t-7.5 18-18.5 7H282q-11 0-18.5-7t-7.5-18 7.5-18.5T282 192h140zm-64 128q11 0 18.5 7.5T384 346t-7.5 18-18.5 7h-76q-11 0-18.5-7t-7.5-18 7.5-18.5T282 320h76z";
  _exports.pathData = pathData;
  const ltr = false;
  _exports.ltr = ltr;
  const accData = _i18nDefaults.ICON_SORT_DESCENDING;
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
  var _default = "SAP-icons-v5/sort-descending";
  _exports.default = _default;
});