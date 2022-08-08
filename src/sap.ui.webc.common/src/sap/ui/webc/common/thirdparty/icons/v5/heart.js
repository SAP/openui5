sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "heart";
  const pathData = "M365 19q31 0 57.5 12T469 63t31.5 47.5T512 168t-11 57.5-32 48.5L274 472q-6 8-18 8-10 0-18-8L43 274q-21-21-32-48.5T0 168t11.5-57.5T43 63t46.5-32T147 19q39 0 65.5 17.5T256 76q17-22 44-39.5T365 19z";
  _exports.pathData = pathData;
  const ltr = false;
  _exports.ltr = ltr;
  const accData = null;
  _exports.accData = accData;
  const collection = "SAP-icons-v5";
  const packageName = "@ui5/webcomponents-icons";
  (0, _Icons.registerIcon)(name, {
    pathData,
    ltr,
    collection,
    packageName
  });
  var _default = "heart";
  _exports.default = _default;
});