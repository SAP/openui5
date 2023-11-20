sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons", "../generated/i18n/i18n-defaults"], function (_exports, _Icons, _i18nDefaults) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "resize-vertical";
  const pathData = "M315 121l-59-59-59 59q-7 7-18 7t-18-7.5-7-18.5 7-18l77-77q7-7 18-7t18 7l77 77q8 8 8 18 0 11-7.5 18.5T333 128t-18-7zm139 103H58q-11 0-18.5-7.5T32 198t7.5-18 18.5-7h396q11 0 18.5 7t7.5 18-7.5 18.5T454 224zm0 115H58q-11 0-18.5-7T32 314t7.5-18.5T58 288h396q11 0 18.5 7.5T480 314t-7.5 18-18.5 7zM256 512q-9 0-18-7l-77-77q-7-7-7-19 0-11 7-18t18-7 18 7l59 59 59-59q7-7 18-7t18.5 7 7.5 18-8 19l-77 77q-7 7-18 7z";
  _exports.pathData = pathData;
  const ltr = false;
  _exports.ltr = ltr;
  const accData = _i18nDefaults.ICON_RESIZE_VERTICAL;
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
  var _default = "SAP-icons-v5/resize-vertical";
  _exports.default = _default;
});