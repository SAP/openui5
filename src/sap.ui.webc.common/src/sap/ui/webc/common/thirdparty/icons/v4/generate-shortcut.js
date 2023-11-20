sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons", "../generated/i18n/i18n-defaults"], function (_exports, _Icons, _i18nDefaults) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "generate-shortcut";
  const pathData = "M80 32h384q14 0 23 9.5t9 22.5v384q0 14-9 23t-23 9H208v-32h256V160H80v32H48V64q0-13 9.5-22.5T80 32zm32 258q2-1 2.5-1t2.5-1l-57-1q-7-1-11.5-5.5T45 270q0-6 5-10.5t11-3.5h84q31 4 31 35l-9 84q0 15-16 15-7-1-11.5-6t-3.5-11l5-58q-18 8-35 18t-30 22-20.5 27-7.5 34 6 31.5 16.5 19T94 476t28 4h-1q16 0 16 16t-16 16l-14-1q-16 0-32.5-5.5t-29.5-17T24 459t-8-43 10-45.5T51 334t31.5-27 29.5-17z";
  _exports.pathData = pathData;
  const ltr = false;
  _exports.ltr = ltr;
  const accData = _i18nDefaults.ICON_GENERATE_SHORTCUT;
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
  var _default = "SAP-icons-v4/generate-shortcut";
  _exports.default = _default;
});