sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons", "../generated/i18n/i18n-defaults"], function (_exports, _Icons, _i18nDefaults) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "resize-vertical";
  const pathData = "M356 123l-93-86q-3-3-6-3-2 0-5 3l-95 87q-5 5-11.5 5t-11.5-5-5-11.5 5-11.5L235 9q9-9 22-9t23 9l99 92q5 5 5 11t-5 11q-6 6-12 6-5 0-11-6zm140 69q6 0 11 4.5t5 11.5-5 11.5-11 4.5H16q-16 0-16-16t16-16h480zm0 96q6 0 11 4.5t5 11.5-5 11.5-11 4.5H16q-16 0-16-16t16-16h480zM263 475l93-86q6-6 11-6 6 0 12 6 5 5 5 11t-5 11l-99 92q-10 9-23 9t-22-9l-101-92q-5-5-5-11.5t5-11.5 11.5-5 11.5 5l95 87q3 3 5 3 3 0 6-3z";
  _exports.pathData = pathData;
  const ltr = false;
  _exports.ltr = ltr;
  const accData = _i18nDefaults.ICON_RESIZE_VERTICAL;
  _exports.accData = accData;
  const collection = "SAP-icons";
  const packageName = "@ui5/webcomponents-icons";
  (0, _Icons.registerIcon)(name, {
    pathData,
    ltr,
    accData,
    collection,
    packageName
  });
  var _default = "resize-vertical";
  _exports.default = _default;
});