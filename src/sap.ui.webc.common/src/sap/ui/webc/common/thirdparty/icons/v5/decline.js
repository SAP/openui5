sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons", "../generated/i18n/i18n-defaults"], function (_exports, _Icons, _i18nDefaults) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "decline";
  const pathData = "M292 256l117 117q7 7 7 18t-7 18-19 7q-11 0-18-7L256 293 140 409q-7 7-18 7-12 0-19-7t-7-18 7-18l117-117-117-116q-7-7-7-18t7-18q8-8 19-8 10 0 18 8l116 116 116-116q8-8 18-8 11 0 19 8 7 7 7 18t-7 18z";
  _exports.pathData = pathData;
  const ltr = false;
  _exports.ltr = ltr;
  const accData = _i18nDefaults.ICON_DECLINE;
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
  var _default = "decline";
  _exports.default = _default;
});