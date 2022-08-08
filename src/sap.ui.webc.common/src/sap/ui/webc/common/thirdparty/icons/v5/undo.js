sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons", "../generated/i18n/i18n-defaults"], function (_exports, _Icons, _i18nDefaults) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "undo";
  const pathData = "M180.5 308q-7 8-18 8t-18-8l-101-101q-11-7-11-21 0-8 3.5-12t7.5-9l101-101q8-8 18-8t18 8q8 7 8 18t-8 19l-59 59h228q27 0 51 10t41.5 27.5 27.5 41.5 10 51-10 51-27.5 41.5-41.5 27.5-51 10h-98q-11 0-18.5-7t-7.5-19q0-11 7.5-18.5t18.5-7.5h98q33 0 55.5-22.5t22.5-55.5-22.5-55.5-55.5-22.5h-228l59 60q8 7 8 18t-8 18z";
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
  var _default = "undo";
  _exports.default = _default;
});