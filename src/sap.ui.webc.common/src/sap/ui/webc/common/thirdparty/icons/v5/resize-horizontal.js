sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons", "../generated/i18n/i18n-defaults"], function (_exports, _Icons, _i18nDefaults) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "resize-horizontal";
  const pathData = "M198 480q-11 0-18-7.5t-7-18.5V58q0-11 7-18.5t18-7.5 18.5 7.5T224 58v396q0 11-7.5 18.5T198 480zm116 0q-11 0-18.5-7.5T288 454V58q0-11 7.5-18.5T314 32t18 7.5 7 18.5v396q0 11-7 18.5t-18 7.5zM103 358q-12 0-19-7L8 274q-8-8-8-18t8-18l76-77q8-8 19-8t18 7.5 7 18.5-7 18l-59 59 59 59q7 7 7 18t-7 18-18 7zm307 0q-11 0-18-7t-7-18 7-18l59-59-59-59q-7-7-7-18t7-18.5 18-7.5 19 8l76 77q7 6 7 18 0 11-7 18l-76 77q-7 7-19 7z";
  _exports.pathData = pathData;
  const ltr = false;
  _exports.ltr = ltr;
  const accData = _i18nDefaults.ICON_RESIZE_HORIZONTAL;
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
  var _default = "SAP-icons-v5/resize-horizontal";
  _exports.default = _default;
});