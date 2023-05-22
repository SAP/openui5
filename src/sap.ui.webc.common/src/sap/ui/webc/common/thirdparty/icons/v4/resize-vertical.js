sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons", "../generated/i18n/i18n-defaults"], function (_exports, _Icons, _i18nDefaults) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "resize-vertical";
  const pathData = "M496 288q6 0 11 4.5t5 11.5-5 11.5-11 4.5H16q-16 0-16-16t16-16h480zm0-96q6 0 11 4.5t5 11.5-5 11.5-11 4.5H16q-16 0-16-16t16-16h480zM263 475q-6 6-11 0l-95-87q-5-5-11.5-5t-11.5 5-5 11.5 5 11.5l101 92q9 9 22 9t23-9l99-92q5-5 5-11t-5-11q-12-12-23 0zm93-352q11 12 23 0 5-5 5-11t-5-11L280 9q-10-9-23-9t-22 9l-101 92q-5 5-5 11.5t5 11.5 11.5 5 11.5-5l95-87q5-6 11 0z";
  _exports.pathData = pathData;
  const ltr = false;
  _exports.ltr = ltr;
  const accData = _i18nDefaults.ICON_RESIZE_VERTICAL;
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
  var _default = "SAP-icons-v4/resize-vertical";
  _exports.default = _default;
});