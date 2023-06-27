sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons", "../generated/i18n/i18n-defaults"], function (_exports, _Icons, _i18nDefaults) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "search";
  const pathData = "M489 436q7 7 7 18t-7.5 18.5T470 480t-18-7L352 373q-26 20-58.5 31.5T224 416q-44 0-82-16t-66-44-44-66-16-82 16-82 44-66 66-44 82-16 82 16 66 44 44 66 16 82q0 37-11.5 69.5T389 336zm-265-71q33 0 61.5-12t50-33.5 33.5-50 12-61.5-12-61.5-33.5-50-50-33.5T224 51t-61.5 12-50 33.5-33.5 50T67 208t12 61.5 33.5 50 50 33.5 61.5 12z";
  _exports.pathData = pathData;
  const ltr = true;
  _exports.ltr = ltr;
  const accData = _i18nDefaults.ICON_SEARCH;
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
  var _default = "SAP-icons-v5/search";
  _exports.default = _default;
});