sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons", "../generated/i18n/i18n-defaults"], function (_exports, _Icons, _i18nDefaults) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "resize";
  const pathData = "M85.5 227q-13 0-20.5-8t-7.5-21V85q0-28 28-28h114q28 0 28 28t-28 28h-85v85q0 13-8 21t-21 8zm341 57q28 0 28 28v114q0 28-28 28h-114q-28 0-28-28 0-13 7.5-21t20.5-8h85v-85q0-13 8-20.5t21-7.5zm57-284q28 0 28 28v142q0 28-28 28-13 0-21-7.5t-8-20.5V96l-357 358h73q13 0 21 7.5t8 20.5-8 21-21 8h-142q-11 0-19-9-9-7-9-20V340q0-28 28-28 13 0 21 7.5t8 20.5v74l358-357h-74q-13 0-21-8t-8-21 8-20.5 21-7.5h142z";
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
  var _default = "resize";
  _exports.default = _default;
});