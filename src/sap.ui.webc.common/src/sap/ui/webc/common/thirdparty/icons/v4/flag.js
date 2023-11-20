sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons", "../generated/i18n/i18n-defaults"], function (_exports, _Icons, _i18nDefaults) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "flag";
  const pathData = "M64 0h32v512H64V0zm307 33q14 0 23.5-2t17-6 16-10T448 0v239q-14 14-30 25-14 9-31 16.5t-35 7.5q-5 0-23.5-5t-40-11-40-11-24.5-5q-29 0-51 7.5T128 288V63q10-17 26-31 14-12 33.5-22T235 0q7 0 27 5t42.5 11.5T346 28t25 5z";
  _exports.pathData = pathData;
  const ltr = true;
  _exports.ltr = ltr;
  const accData = _i18nDefaults.ICON_FLAG;
  _exports.accData = accData;
  const collection = "SAP-icons-v4";
  const packageName = "@ui5/webcomponents-icons";
  (0, _Icons.registerIcon)(name, {
    pathData,
    ltr,
    accData,
    collection,
    packageName
  });
  var _default = "SAP-icons-v4/flag";
  _exports.default = _default;
});