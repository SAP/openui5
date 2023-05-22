sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "inspect";
  const pathData = "M102-7q0-11 7.5-18t18.5-7h358q11 0 18.5 7T512-7v359q0 11-7.5 18t-18.5 7H128q-11 0-18.5-7t-7.5-18V-7zm51 333h307V19H153v307zm136-212q-13-13-6-28 6-16 24-16h77q10 0 17.5 7t7.5 18v77q0 18-16 24-15 7-28-6l-20-20-97 97q-8 8-18 8t-18-8-8-18 8-18l97-97zM51 429h435q11 0 18.5 7t7.5 18-7.5 18.5T486 480H26q-11 0-18.5-7.5T0 454V-6q0-11 7.5-18.5T26-32t18 7.5T51-6v435z";
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
  var _default = "SAP-icons-v5/inspect";
  _exports.default = _default;
});