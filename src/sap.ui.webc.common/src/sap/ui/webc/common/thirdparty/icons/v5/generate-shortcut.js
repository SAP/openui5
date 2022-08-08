sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons", "../generated/i18n/i18n-defaults"], function (_exports, _Icons, _i18nDefaults) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "generate-shortcut";
  const pathData = "M435 32q33 0 55 22t22 55v296q0 32-22 54.5T435 482h-76q-12 0-19-7.5t-7-18.5 7-18.5 19-7.5h76q26 0 26-25V186H52v219q0 25 25 25h77q11 0 18 7.5t7 18.5-7 18.5-18 7.5H77q-32 0-54.5-22.5T0 405V109q0-33 22.5-55T77 32h358zm26 102v-25q0-26-26-26H77q-25 0-25 26v25h409zM197 357q-8 8-18 8-9 0-17-8-8-7-8-18t8-18l76-77q7-7 18-7t18 7l77 77q8 8 8 18t-8 18-18 8-18-8l-33-33v143q0 11-7.5 18t-18.5 7q-26 0-26-25V324z";
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
  var _default = "generate-shortcut";
  _exports.default = _default;
});