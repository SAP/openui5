sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons", "../generated/i18n/i18n-defaults"], function (_exports, _Icons, _i18nDefaults) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "drill-up";
  const pathData = "M256 32q11 0 19 8l102 109q7 7 7 17 0 11-7.5 18.5T358 192q-10 0-18-8l-84-89-84 89q-8 8-18 8-11 0-18.5-7.5T128 166q0-10 7-17L237 40q8-8 19-8zm0 144q11 0 19 8l102 109q7 7 7 17 0 11-7.5 18.5T358 336q-10 0-18-8l-84-89-84 89q-8 8-18 8-11 0-18.5-7.5T128 310q0-10 7-17l102-109q8-8 19-8zm0 144q11 0 19 8l102 109q7 7 7 17 0 11-7.5 18.5T358 480q-10 0-18-8l-84-89-84 89q-8 8-18 8-11 0-18.5-7.5T128 454q0-10 7-17l102-109q8-8 19-8z";
  _exports.pathData = pathData;
  const ltr = false;
  _exports.ltr = ltr;
  const accData = _i18nDefaults.ICON_DRILL_UP;
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
  var _default = "SAP-icons-v5/drill-up";
  _exports.default = _default;
});