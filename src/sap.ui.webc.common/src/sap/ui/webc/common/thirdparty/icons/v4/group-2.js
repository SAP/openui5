sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons", "../generated/i18n/i18n-defaults"], function (_exports, _Icons, _i18nDefaults) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "group-2";
  const pathData = "M415 64h64q14 0 23 9t9 23v320q0 13-9 22.5t-23 9.5h-64v-32h64V96h-64V64zM-1 416V96q0-14 9.5-23T31 64h64v32H31v320h64v32H31q-13 0-22.5-9.5T-1 416zm144-96h224q16 0 16 16 0 6-4.5 11t-11.5 5H143q-6 0-11-5t-5-11q0-7 5-11.5t11-4.5zm0-96h224q16 0 16 16 0 6-4.5 11t-11.5 5H143q-6 0-11-5t-5-11q0-7 5-11.5t11-4.5zm-16-80q0-7 5-11.5t11-4.5h224q16 0 16 16 0 6-4.5 11t-11.5 5H143q-6 0-11-5t-5-11z";
  _exports.pathData = pathData;
  const ltr = false;
  _exports.ltr = ltr;
  const accData = _i18nDefaults.ICON_GROUP_2;
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
  var _default = "SAP-icons-v4/group-2";
  _exports.default = _default;
});