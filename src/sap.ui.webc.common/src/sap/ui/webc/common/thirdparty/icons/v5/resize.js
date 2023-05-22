sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons", "../generated/i18n/i18n-defaults"], function (_exports, _Icons, _i18nDefaults) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "resize";
  const pathData = "M483.5 0q28 0 28 28v142q0 28-28 28-13 0-21-7.5t-8-20.5V96l-357 358h73q13 0 21 7.5t8 20.5-8 21-21 8h-142q-11 0-19-9-9-7-9-20V340q0-28 28-28 13 0 21 7.5t8 20.5v74l358-357h-74q-13 0-21-8t-8-21 8-20.5 21-7.5h142zm-394 224q-12 0-19.5-7t-7.5-19v-54q0-34 23-57t57-23h53q12 0 19.5 7.5t7.5 19.5-7.5 19.5-19.5 7.5h-53q-26 0-26 26v54q0 12-7.5 19t-19.5 7zm333 63q12 0 19 7.5t7 19.5v53q0 34-22.5 57t-57.5 23h-53q-12 0-19-7.5t-7-19.5 7-19.5 19-7.5h54q11 0 18.5-7t7.5-19v-54q0-12 7.5-19t19.5-7z";
  _exports.pathData = pathData;
  const ltr = false;
  _exports.ltr = ltr;
  const accData = _i18nDefaults.ICON_RESIZE;
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
  var _default = "SAP-icons-v5/resize";
  _exports.default = _default;
});