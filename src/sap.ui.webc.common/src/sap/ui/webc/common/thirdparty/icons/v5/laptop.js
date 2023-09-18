sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons", "../generated/i18n/i18n-defaults"], function (_exports, _Icons, _i18nDefaults) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "laptop";
  const pathData = "M486 396q11 0 18.5 7t7.5 18-7.5 19-18.5 8H26q-11 0-18.5-8T0 421t7.5-18 18.5-7h8q-2-10-2-17V131q0-28 19.5-47.5T100 64h312q29 0 48.5 19.5T480 131v248q0 7-2 17h8zM100 115q-7 0-12 5t-5 11v248q0 7 5 12t12 5h313q6 0 11-5t5-12V131q0-6-5-11t-12-5H100z";
  _exports.pathData = pathData;
  const ltr = false;
  _exports.ltr = ltr;
  const accData = _i18nDefaults.ICON_LAPTOP;
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
  var _default = "SAP-icons-v5/laptop";
  _exports.default = _default;
});