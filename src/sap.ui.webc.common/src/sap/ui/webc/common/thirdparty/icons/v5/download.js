sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons", "../generated/i18n/i18n-defaults"], function (_exports, _Icons, _i18nDefaults) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "download";
  const pathData = "M123 261q-8-8-8-18 0-11 7.5-18t18.5-7 18 7l71 72V26q0-11 7.5-18.5T256 0t18.5 7.5T282 26v271l71-72q7-7 18-7t18.5 7 7.5 18q0 10-8 18L274 376q-8 8-18 8t-18-8zm363 200q11 0 18.5 7t7.5 18-7.5 18.5T486 512H26q-11 0-18.5-7.5T0 486t7.5-18 18.5-7h460z";
  _exports.pathData = pathData;
  const ltr = false;
  _exports.ltr = ltr;
  const accData = _i18nDefaults.ICON_DOWNLOAD;
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
  var _default = "SAP-icons-v5/download";
  _exports.default = _default;
});