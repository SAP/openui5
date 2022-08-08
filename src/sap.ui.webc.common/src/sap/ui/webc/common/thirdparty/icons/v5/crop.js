sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons", "../generated/i18n/i18n-defaults"], function (_exports, _Icons, _i18nDefaults) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "crop";
  const pathData = "M210 139q-11 0-17.5-6t-6.5-17 6.5-17.5T210 92h139q29 0 49.5 20.5T419 162v140q0 10-6.5 16.5T395 325t-17-6.5-6-16.5V162q0-23-23-23H210zm278 232q11 0 17.5 6t6.5 17-6.5 17.5T488 418h-69v69q0 11-6.5 17.5T395 511t-17-6.5-6-17.5v-69H163q-29 0-49.5-20.5T93 348V139H24q-23 0-23-23 0-11 6-17.5T24 92h69V23q0-11 6.5-17T117 0q23 0 23 23v325q0 23 23 23h325z";
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
  var _default = "crop";
  _exports.default = _default;
});