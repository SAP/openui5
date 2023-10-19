sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons", "../generated/i18n/i18n-defaults"], function (_exports, _Icons, _i18nDefaults) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "response";
  const pathData = "M192 151q60 0 112.5 21t91.5 58.5 61.5 89T480 432v54q0 11-7.5 18.5T454 512t-18-7.5-7-18.5v-54q0-50-18.5-92.5t-50.5-73-75-47.5-93-17h-74l105 107q7 7 7 18t-7.5 18.5T204 353q-10 0-18-8L39 194q-7-7-7-18 0-10 7-17L186 8q8-8 18-8 11 0 18.5 7.5T230 26q0 10-7 17L118 151h74z";
  _exports.pathData = pathData;
  const ltr = false;
  _exports.ltr = ltr;
  const accData = _i18nDefaults.ICON_RESPONSE;
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
  var _default = "SAP-icons-v5/response";
  _exports.default = _default;
});