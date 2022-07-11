sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons", "../generated/i18n/i18n-defaults"], function (_exports, _Icons, _i18nDefaults) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "expand";
  const pathData = "M361.5 335q11-9 22-9 13 0 22 9t9 22q0 12-9 21l-124 124q-10 10-22 10-10 0-22-10l-123-124q-10-9-10-21 0-13 10-22 9-9 21-9 13 0 22 9l102 102zm-205-157q-9 10-22 10-12 0-21-10-10-10-10-21 0-12 10-22l124-124q9-9 21-9 13 0 22 9l124 124q9 9 9 22 0 12-9 21-9 10-22 10-12 0-21-10l-103-102z";
  _exports.pathData = pathData;
  const ltr = false;
  _exports.ltr = ltr;
  const accData = _i18nDefaults.ICON_EXPAND;
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
  var _default = "expand";
  _exports.default = _default;
});