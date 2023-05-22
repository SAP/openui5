sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons", "../generated/i18n/i18n-defaults"], function (_exports, _Icons, _i18nDefaults) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "full-screen";
  const pathData = "M155 461q11 0 18 7t7 18-7 18.5-18 7.5H27q-11 0-18.5-7.5T1 486V359q0-11 7.5-18.5T27 333t18 7.5 7 18.5v66l104-105q7-7 18-7t18 7 7 18-7 18L88 461h67zM487 0q11 0 18 7.5t7 18.5v128q0 11-7 18t-18 7-18.5-7-7.5-18V88L356 192q-7 7-18 7t-18-7-7-18 7-18L425 51h-66q-11 0-18.5-7T333 26t7.5-18.5T359 0h128zM88 224q-12 0-19.5-7.5T61 197v-53q0-34 23-57t57-23h53q12 0 19.5 7.5T221 91t-7.5 19-19.5 7h-53q-12 0-19.5 7.5T114 144v53q0 12-7 19.5T88 224zm333 63q26 0 26 26v54q0 34-23 56.5T367 446h-53q-12 0-19.5-7t-7.5-19 7.5-19.5T314 393h53q12 0 19.5-7.5T394 366v-53q0-12 7.5-19t19.5-7z";
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
  var _default = "SAP-icons-v5/full-screen";
  _exports.default = _default;
});