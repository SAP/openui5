sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons", "../generated/i18n/i18n-defaults"], function (_exports, _Icons, _i18nDefaults) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "drill-up";
  const pathData = "M268 89q-5-5-11.5-5T245 89l-126 97q-11 9-23.5 9.5T74 186q-10-9-10-22.5T74 141L234 10q9-10 22.5-10T279 10l160 129q9 9 9 22.5t-9 22.5q-10 10-22 9.5t-23-9.5zm-2 161q-4-4-9.5-4t-9.5 4l-106 82q-9 8-19.5 8t-18.5-8-8-19 8-19l134-110q8-8 19-8t19 8l135 109q8 8 8 18.5t-8 18.5q-17 17-38 0zm0 149q-9-9-17 0l-95 73q-8 7-17.5 7t-16.5-7-7-17 7-17l120-98q8-8 17.5-8t16.5 8l120 97q7 7 7 16.5t-7 16.5q-15 15-33 0z";
  _exports.pathData = pathData;
  const ltr = false;
  _exports.ltr = ltr;
  const accData = _i18nDefaults.ICON_DRILL_UP;
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
  var _default = "SAP-icons-v4/drill-up";
  _exports.default = _default;
});