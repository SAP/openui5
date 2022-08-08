sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons", "../generated/i18n/i18n-defaults"], function (_exports, _Icons, _i18nDefaults) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "flag";
  const pathData = "M444 53q5 2 8.5 8.5T456 73v248q0 8-4.5 13.5T442 344l-18 7q-45 20-89 20-26 0-50-7t-47-18l-15-7q-28-15-59-15t-57 15v148q0 25-25 25t-25-25V26Q57 1 82 1t25 25v8q28-11 57-11 21 0 42 5.5T246 46l14 10q38 20 76 20 17 0 33.5-4T402 61l17-8q6-3 13-3 6 0 12 3z";
  _exports.pathData = pathData;
  const ltr = true;
  _exports.ltr = ltr;
  const accData = _i18nDefaults.ICON_FLAG;
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
  var _default = "flag";
  _exports.default = _default;
});