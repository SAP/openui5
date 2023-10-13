sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons", "../generated/i18n/i18n-defaults"], function (_exports, _Icons, _i18nDefaults) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "delete";
  const pathData = "M454 109q11 0 18.5 7t7.5 18-7.5 18.5T454 160h-19v294q0 24-17 41t-41 17H135q-24 0-41-17t-17-41V160H58q-11 0-18.5-7.5T32 134t7.5-18 18.5-7h70V58q0-24 17-41t41-17h140q24 0 41 17t17 41v51h70zm-275 0h154V58q0-7-7-7H186q-7 0-7 7v51zm205 51H128v294q0 7 7 7h242q7 0 7-7V160zm-186 64q11 0 18.5 7.5T224 250v140q0 11-7.5 18.5T198 416t-18-7.5-7-18.5V250q0-11 7-18.5t18-7.5zm116 0q11 0 18 7.5t7 18.5v140q0 11-7 18.5t-18 7.5-18.5-7.5T288 390V250q0-11 7.5-18.5T314 224z";
  _exports.pathData = pathData;
  const ltr = false;
  _exports.ltr = ltr;
  const accData = _i18nDefaults.ICON_DELETE;
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
  var _default = "SAP-icons-v5/delete";
  _exports.default = _default;
});