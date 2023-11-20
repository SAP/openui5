sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons", "../generated/i18n/i18n-defaults"], function (_exports, _Icons, _i18nDefaults) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "sort-ascending";
  const pathData = "M217 124q8 8 8 18 0 11-7.5 18.5T199 168q-10 0-17-7l-45-44v337q0 11-7 18.5t-18 7.5-18.5-7.5T86 454V119l-42 42q-7 7-18 7t-18.5-7.5T0 142q0-10 8-18l87-85q7-7 18-7 10 0 17 7zm65-9q-11 0-18.5-7T256 90t7.5-18.5T282 64h76q11 0 18.5 7.5T384 90t-7.5 18-18.5 7h-76zm0 128q-11 0-18.5-7t-7.5-18 7.5-18.5T282 192h140q11 0 18.5 7.5T448 218t-7.5 18-18.5 7H282zm204 77q11 0 18.5 7.5T512 346t-7.5 18-18.5 7H282q-11 0-18.5-7t-7.5-18 7.5-18.5T282 320h204z";
  _exports.pathData = pathData;
  const ltr = false;
  _exports.ltr = ltr;
  const accData = _i18nDefaults.ICON_SORT_ASCENDING;
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
  var _default = "SAP-icons-v5/sort-ascending";
  _exports.default = _default;
});