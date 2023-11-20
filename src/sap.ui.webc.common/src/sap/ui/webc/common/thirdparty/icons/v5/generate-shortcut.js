sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons", "../generated/i18n/i18n-defaults"], function (_exports, _Icons, _i18nDefaults) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "generate-shortcut";
  const pathData = "M390 32q38 0 64 26t26 64v268q0 38-26 64t-64 26h-14q-11 0-18-7.5t-7-18.5 7-18 18-7h14q17 0 28-11t11-28V211H83v179q0 17 11 28t28 11h12q11 0 18.5 7t7.5 18-7.5 18.5T134 480h-12q-38 0-64-26t-26-64V122q0-38 26-64t64-26h268zm39 128v-38q0-17-11-28t-28-11H122q-17 0-28 11t-11 28v38h346zm-72 180q8 8 8 18 0 11-7.5 18.5T339 384q-10 0-18-8l-33-33v111q0 11-7.5 18.5T262 480t-18-7.5-7-18.5V343l-33 33q-8 8-18 8-11 0-18.5-7.5T160 358q0-10 8-18l76-77q9-7 18-7 10 0 19 7z";
  _exports.pathData = pathData;
  const ltr = false;
  _exports.ltr = ltr;
  const accData = _i18nDefaults.ICON_GENERATE_SHORTCUT;
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
  var _default = "SAP-icons-v5/generate-shortcut";
  _exports.default = _default;
});