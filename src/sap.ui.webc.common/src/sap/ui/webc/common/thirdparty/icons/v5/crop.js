sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons", "../generated/i18n/i18n-defaults"], function (_exports, _Icons, _i18nDefaults) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "crop";
  const pathData = "M486 365q11 0 18.5 7t7.5 18-7.5 18.5T486 416h-70v70q0 11-7.5 18.5T390 512t-18-7.5-7-18.5v-70H186q-38 0-64-26t-26-64V147H26q-11 0-18.5-7T0 122t7.5-18.5T26 96h70V26q0-11 7.5-18.5T122 0t18 7.5 7 18.5v300q0 17 11 28t28 11h300zM218 147q-11 0-18.5-7t-7.5-18 7.5-18.5T218 96h108q38 0 64 26t26 64v108q0 11-7.5 18.5T390 320t-18-7.5-7-18.5V186q0-17-11-28t-28-11H218z";
  _exports.pathData = pathData;
  const ltr = false;
  _exports.ltr = ltr;
  const accData = _i18nDefaults.ICON_CROP;
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
  var _default = "SAP-icons-v5/crop";
  _exports.default = _default;
});