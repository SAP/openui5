sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons", "../generated/i18n/i18n-defaults"], function (_exports, _Icons, _i18nDefaults) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "forward";
  const pathData = "M473 160q7 7 7 18t-7 18L332 337q-8 8-18 8t-18-8-8-18 8-18l97-97h-79q-48 0-90 18t-73.5 49.5T101 345t-18 90v51q0 11-7 18.5T58 512t-18.5-7.5T32 486v-51q0-58 22.5-109.5T115 236t89.5-60.5T314 153h79l-85-85q-7-7-7-18t7.5-18 18.5-7 18 7z";
  _exports.pathData = pathData;
  const ltr = false;
  _exports.ltr = ltr;
  const accData = _i18nDefaults.ICON_FORWARD;
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
  var _default = "forward";
  _exports.default = _default;
});