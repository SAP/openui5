sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons", "../generated/i18n/i18n-defaults"], function (_exports, _Icons, _i18nDefaults) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "add-filter";
  const pathData = "M352 32q20 0 26.5 12.5T385 64q0 9-6 18L266 212q-10 10-10 22v118l-100 91q-7 5-12 5-6 0-11-4.5t-5-11.5V234q0-13-9-22-32-37-57-65l-38.5-44L6 82q-6-9-6-18 0-7 6.5-19.5T32 32h320zM243 190l4.5-5 12-14 17.5-20.5 20-23.5q24-28 55-63H33l8 9.5L61 97l26.5 30.5 27 30.5 20.5 23 8 9q17 19 17 44v162l64-59V234q0-25 19-44zm269 194v32h-96v96h-32v-96h-96v-32h96v-96h32v96h96z";
  _exports.pathData = pathData;
  const ltr = false;
  _exports.ltr = ltr;
  const accData = _i18nDefaults.ICON_ADD_FILTER;
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
  var _default = "add-filter";
  _exports.default = _default;
});