sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons", "../generated/i18n/i18n-defaults"], function (_exports, _Icons, _i18nDefaults) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "back-to-top";
  const pathData = "M26 51q-11 0-18.5-7T0 26 7.5 7.5 26 0h460q11 0 18.5 7.5T512 26t-7.5 18-18.5 7H26zm363 200q8 8 8 18 0 11-7.5 18t-18.5 7-18-7l-71-72v271q0 11-7.5 18.5T256 512t-18.5-7.5T230 486V215l-71 72q-7 7-18 7t-18.5-7-7.5-18q0-10 8-18l115-116q9-7 18-7t18 7z";
  _exports.pathData = pathData;
  const ltr = false;
  _exports.ltr = ltr;
  const accData = _i18nDefaults.ICON_BACK_TO_TOP;
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
  var _default = "SAP-icons-v5/back-to-top";
  _exports.default = _default;
});