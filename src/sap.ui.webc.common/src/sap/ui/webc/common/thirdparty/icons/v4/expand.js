sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons", "../generated/i18n/i18n-defaults"], function (_exports, _Icons, _i18nDefaults) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "expand";
  const pathData = "M22 227l87-95q3-3 3-5 0-3-3-6L23 28q-6-6-6-11 0-6 6-12 5-5 11-5t11 5l92 99q9 10 9 23t-9 22L45 250q-5 5-11 5-4 0-12-5-6-6-6-12t6-11zm58 93v128h384V64H208V32h256q13 0 22.5 9t9.5 23v384q0 13-9.5 22.5T464 480H80q-14 0-23-9.5T48 448V320h32zm176-80V128h32v112h112v32H288v112h-32V272H144v-32h112z";
  _exports.pathData = pathData;
  const ltr = false;
  _exports.ltr = ltr;
  const accData = _i18nDefaults.ICON_EXPAND;
  _exports.accData = accData;
  const collection = "SAP-icons";
  const packageName = "@ui5/webcomponents-icons";
  (0, _Icons.registerIcon)(name, {
    pathData,
    ltr,
    accData,
    collection,
    packageName
  });
  var _default = "expand";
  _exports.default = _default;
});