sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons", "../generated/i18n/i18n-defaults"], function (_exports, _Icons, _i18nDefaults) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "undo";
  const pathData = "M352 160q33 0 62 12.5t51 34.5 34.5 51 12.5 62-12.5 62-34.5 51-51 34.5-62 12.5H154q-11 0-18.5-7.5T128 454t7.5-18 18.5-7h198q23 0 42.5-8.5T429 397t23.5-35 8.5-42q0-23-8.5-42.5T429 243t-34.5-23.5T352 211H83l101 97q8 8 8 18 0 11-7.5 18.5T166 352q-10 0-17-7L8 210q-8-6-8-18 0-11 8-19L149 39q7-7 17-7 11 0 18.5 7.5T192 58q0 10-8 18l-88 84h256z";
  _exports.pathData = pathData;
  const ltr = false;
  _exports.ltr = ltr;
  const accData = _i18nDefaults.ICON_UNDO;
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
  var _default = "SAP-icons-v5/undo";
  _exports.default = _default;
});