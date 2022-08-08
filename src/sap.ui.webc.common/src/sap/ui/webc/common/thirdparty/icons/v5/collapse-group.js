sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons", "../generated/i18n/i18n-defaults"], function (_exports, _Icons, _i18nDefaults) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "collapse-group";
  const pathData = "M156.5 243q-10 9-22 9-13 0-22-9-9-11-9-22 0-13 9-22l124-124q9-9 22-9 12 0 21 9l124 124q10 9 10 22 0 12-10 22-9 9-21 9-13 0-22-9l-102-103zm-2 225q-10 9-22 9-13 0-22-9-9-11-9-22 0-13 9-22l124-124q9-9 22-9 12 0 22 9l124 124q9 9 9 22 0 11-9 22-10 9-22 9-13 0-22-9l-102-103z";
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
  var _default = "collapse-group";
  _exports.default = _default;
});