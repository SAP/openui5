sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons", "../generated/i18n/i18n-defaults"], function (_exports, _Icons, _i18nDefaults) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "forward";
  const pathData = "M320 151h74L289 43q-7-9-7-17 0-11 7.5-18.5T308 0q10 0 18 8l147 151q7 7 7 17 0 11-7 18L326 345q-8 8-18 8-11 0-18.5-7.5T282 327q0-9 7-18l105-107h-74q-49 0-92.5 17T152 266.5t-50.5 73T83 432v54q0 11-7 18.5T58 512t-18.5-7.5T32 486v-54q0-61 22.5-112.5t61.5-89 91.5-58.5T320 151z";
  _exports.pathData = pathData;
  const ltr = false;
  _exports.ltr = ltr;
  const accData = _i18nDefaults.ICON_FORWARD;
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
  var _default = "SAP-icons-v5/forward";
  _exports.default = _default;
});