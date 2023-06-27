sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons", "../generated/i18n/i18n-defaults"], function (_exports, _Icons, _i18nDefaults) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "collapse-group";
  const pathData = "M267.5 120q-12-11-23 0l-159 157q-10 10-23 10t-22-10q-10-9-10-22t10-23l193-191q9-9 22.5-9t22.5 9l192 192q10 10 10 23t-10 23q-9 9-22.5 9t-22.5-9zm0 193q-12-11-23 0l-159 157q-10 10-23 10t-22-10q-10-9-10-22t10-23l193-191q9-9 22.5-9t22.5 9l192 192q10 10 10 23t-10 23q-9 9-22.5 9t-22.5-9z";
  _exports.pathData = pathData;
  const ltr = false;
  _exports.ltr = ltr;
  const accData = _i18nDefaults.ICON_COLLAPSE_GROUP;
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
  var _default = "SAP-icons-v4/collapse-group";
  _exports.default = _default;
});