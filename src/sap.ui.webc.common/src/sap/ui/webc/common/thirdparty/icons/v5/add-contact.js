sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons", "../generated/i18n/i18n-defaults"], function (_exports, _Icons, _i18nDefaults) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "add-contact";
  const pathData = "M486 86q11 0 18.5 7.5T512 112t-7.5 18-18.5 7h-61v61q0 11-7 18.5t-18 7.5-18.5-7.5T374 198v-61h-60q-11 0-18.5-7t-7.5-18 7.5-18.5T314 86h60V26q0-11 7.5-18.5T400 0t18 7.5 7 18.5v60h61zm-64 234q11 0 18.5 7.5T448 346v76q0 38-26 64t-64 26H90q-38 0-64-26T0 422V154q0-38 26-64t64-26h108q11 0 18.5 7.5T224 90t-7.5 18-18.5 7H90q-17 0-28 11t-11 28v268q0 17 11 28t28 11h268q17 0 28-11t11-28v-76q0-11 7-18.5t18-7.5zM176 208q0-20 14-34t34-14 34 14 14 34-14 34-34 14-34-14-14-34zM96 385q0-25 20.5-45t49.5-20h116q29 0 49.5 20t20.5 45q0 14-7.5 22.5T326 416H122q-11 0-18.5-8.5T96 385z";
  _exports.pathData = pathData;
  const ltr = false;
  _exports.ltr = ltr;
  const accData = _i18nDefaults.ICON_ADD_CONTACT;
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
  var _default = "SAP-icons-v5/add-contact";
  _exports.default = _default;
});