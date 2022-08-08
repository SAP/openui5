sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons", "../generated/i18n/i18n-defaults"], function (_exports, _Icons, _i18nDefaults) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "back-to-top";
  const pathData = "M480 0q14 0 23 9.5t9 22.5q0 14-9 23t-23 9H32q-14 0-23-9T0 32Q0 19 9 9.5T32 0h448zm-98 239q6 5 6 11t-6 12q-6 5-12 5-5 0-11-5l-87-87v321q0 16-16 16t-16-16V177l-85 85q-5 5-11 5t-11-5q-6-6-6-11 0-6 6-12l102-101q10-10 22.5-10t22.5 10z";
  _exports.pathData = pathData;
  const ltr = false;
  _exports.ltr = ltr;
  const accData = _i18nDefaults.ICON_BACK_TO_TOP;
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
  var _default = "back-to-top";
  _exports.default = _default;
});