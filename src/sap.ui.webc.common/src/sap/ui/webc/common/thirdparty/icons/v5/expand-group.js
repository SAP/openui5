sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons", "../generated/i18n/i18n-defaults"], function (_exports, _Icons, _i18nDefaults) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "expand-group";
  const pathData = "M390 64q11 0 18.5 7.5T416 90q0 10-7 17L275 248q-8 8-19 8-12 0-18-8L103 107q-7-7-7-17 0-11 7.5-18.5T122 64q10 0 18 8l116 121L372 72q8-8 18-8zm0 192q11 0 18.5 7.5T416 282q0 10-7 17L275 440q-8 8-19 8-12 0-18-8L103 299q-7-7-7-17 0-11 7.5-18.5T122 256q10 0 18 8l116 121 116-121q8-8 18-8z";
  _exports.pathData = pathData;
  const ltr = false;
  _exports.ltr = ltr;
  const accData = _i18nDefaults.ICON_EXPAND_GROUP;
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
  var _default = "SAP-icons-v5/expand-group";
  _exports.default = _default;
});