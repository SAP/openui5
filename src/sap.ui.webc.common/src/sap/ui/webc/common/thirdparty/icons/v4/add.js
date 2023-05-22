sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons", "../generated/i18n/i18n-defaults"], function (_exports, _Icons, _i18nDefaults) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "add";
  const pathData = "M32 240q0-7 5-11.5t11-4.5h176V48q0-7 5-11.5t11-4.5h32q16 0 16 16v176h176q16 0 16 16v32q0 16-16 16H288v176q0 16-16 16h-32q-6 0-11-4.5t-5-11.5V288H48q-6 0-11-4.5T32 272v-32z";
  _exports.pathData = pathData;
  const ltr = false;
  _exports.ltr = ltr;
  const accData = _i18nDefaults.ICON_ADD;
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
  var _default = "SAP-icons-v4/add";
  _exports.default = _default;
});