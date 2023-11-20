sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons", "../generated/i18n/i18n-defaults"], function (_exports, _Icons, _i18nDefaults) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "add";
  const pathData = "M454 230q11 0 18.5 7.5T480 256t-7.5 18.5T454 282H282v172q0 11-7.5 18.5T256 480t-18.5-7.5T230 454V282H58q-11 0-18.5-7.5T32 256t7.5-18.5T58 230h172V58q0-11 7.5-18.5T256 32t18.5 7.5T282 58v172h172z";
  _exports.pathData = pathData;
  const ltr = false;
  _exports.ltr = ltr;
  const accData = _i18nDefaults.ICON_ADD;
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
  var _default = "SAP-icons-v5/add";
  _exports.default = _default;
});