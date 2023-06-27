sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons", "../generated/i18n/i18n-defaults"], function (_exports, _Icons, _i18nDefaults) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "zoom-out";
  const pathData = "M16 208q0-44 16-82t44.5-66T143 16t81-16q44 0 82 16t66 44 44 66 16 82q0 37-11.5 69.5T389 336l100 100q7 7 7 18t-7 18.5-18 7.5-18-7L353 373q-26 20-59 31.5T224 416q-43 0-81-16t-66.5-44T32 290t-16-82zm52 0q0 33 12 61.5t33 50 49.5 33.5 61.5 12 61.5-12 50-33.5 33.5-50 12-61.5-12-61.5-33.5-50-50-33.5T224 51t-61.5 12T113 96.5t-33 50T68 208zm70 26q-11 0-18.5-7.5T112 208t7.5-18.5T138 182h173q11 0 18 7.5t7 18.5-7 18.5-18 7.5H138z";
  _exports.pathData = pathData;
  const ltr = false;
  _exports.ltr = ltr;
  const accData = _i18nDefaults.ICON_ZOOM_OUT;
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
  var _default = "SAP-icons-v5/zoom-out";
  _exports.default = _default;
});