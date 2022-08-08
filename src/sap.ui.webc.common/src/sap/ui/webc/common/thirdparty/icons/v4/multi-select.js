sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons", "../generated/i18n/i18n-defaults"], function (_exports, _Icons, _i18nDefaults) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "multi-select";
  const pathData = "M92 97l80-97 20 19L92 137 32 78l20-21zm372-32q16 0 16 16t-16 16H273q-6 0-11-5t-5-11q0-16 16-16h191zM92 283l80-96 20 19L92 323l-60-59 20-19zm372-27q16 0 16 16t-16 16H273q-6 0-11-5t-5-11q0-16 16-16h191zM32 512V384h128v128H32zm32-96v64h64v-64H64zm400 32q16 0 16 16t-16 16H273q-6 0-11-5t-5-11q0-16 16-16h191z";
  _exports.pathData = pathData;
  const ltr = true;
  _exports.ltr = ltr;
  const accData = _i18nDefaults.ICON_MULTI_SELECT;
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
  var _default = "multi-select";
  _exports.default = _default;
});