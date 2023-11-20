sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons", "../generated/i18n/i18n-defaults"], function (_exports, _Icons, _i18nDefaults) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "collapse-group";
  const pathData = "M390 256q-10 0-18-8L256 127 140 248q-8 8-18 8-11 0-18.5-7.5T96 230q0-10 7-17L238 72q6-8 18-8 11 0 19 8l134 141q7 7 7 17 0 11-7.5 18.5T390 256zm0 192q-10 0-18-8L256 319 140 440q-8 8-18 8-11 0-18.5-7.5T96 422q0-10 7-17l135-141q6-8 18-8 11 0 19 8l134 141q7 7 7 17 0 11-7.5 18.5T390 448z";
  _exports.pathData = pathData;
  const ltr = false;
  _exports.ltr = ltr;
  const accData = _i18nDefaults.ICON_COLLAPSE_GROUP;
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
  var _default = "SAP-icons-v5/collapse-group";
  _exports.default = _default;
});