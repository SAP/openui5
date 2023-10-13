sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons", "../generated/i18n/i18n-defaults"], function (_exports, _Icons, _i18nDefaults) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "ipad";
  const pathData = "M405 0q31 0 53 21t22 51v368q0 30-22 51t-53 21H107q-31 0-53-21t-22-51V72q0-30 22-51t53-21h298zm24 438V74H83v364h346z";
  _exports.pathData = pathData;
  const ltr = false;
  _exports.ltr = ltr;
  const accData = _i18nDefaults.ICON_IPAD;
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
  var _default = "SAP-icons-v5/ipad";
  _exports.default = _default;
});