sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons", "../generated/i18n/i18n-defaults"], function (_exports, _Icons, _i18nDefaults) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "overflow";
  const pathData = "M448 192q26 0 45 19t19 45-19 45-45 19-45-19-19-45 19-45 45-19zm0 96q14 0 23-9t9-23-9-23-23-9-23 9-9 23 9 23 23 9zm-192-96q26 0 45 19t19 45-19 45-45 19-45-19-19-45 19-45 45-19zm0 96q14 0 23-9t9-23-9-23-23-9-23 9-9 23 9 23 23 9zM64 192q26 0 45 19t19 45-19 45-45 19-45-19-19-45 19-45 45-19zm0 96q14 0 23-9t9-23-9-23-23-9-23 9-9 23 9 23 23 9z";
  _exports.pathData = pathData;
  const ltr = false;
  _exports.ltr = ltr;
  const accData = _i18nDefaults.ICON_OVERFLOW;
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
  var _default = "SAP-icons-v4/overflow";
  _exports.default = _default;
});