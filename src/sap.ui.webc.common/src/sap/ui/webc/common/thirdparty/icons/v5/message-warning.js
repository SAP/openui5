sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons", "../generated/i18n/i18n-defaults"], function (_exports, _Icons, _i18nDefaults) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "message-warning";
  const pathData = "M504 387q8 13 8 30 0 25-18 44.5T448 481H64q-28 0-46-19.5T0 417q0-17 8-30L200 34q9-17 24-25.5T256 0t32 8.5T312 34zM224 281q0 14 9 23.5t23 9.5 23-9.5 9-23.5V153q0-13-9-22.5t-23-9.5-23 9.5-9 22.5v128zm32 149q16 0 27-11t11-28q0-16-11-27t-27-11-27 11-11 27q0 17 11 28t27 11z";
  _exports.pathData = pathData;
  const ltr = false;
  _exports.ltr = ltr;
  const accData = _i18nDefaults.ICON_MESSAGE_WARNING;
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
  var _default = "message-warning";
  _exports.default = _default;
});