sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "journey-arrive";
  const pathData = "M160 64h320q14 0 23 9t9 23v320q0 14-9 23t-23 9H160q-14 0-23-9t-9-23v-64h32v64h320V96H160v64h-32V96q0-14 9-23t23-9zM16 240h288l-75-68q-5-6-5-12t5-11 11-5 11 5l92 83q9 10 9 23t-9 23l-92 86q-5 5-11 5-3 0-11-5-5-6-5-12t5-11l75-69H16q-16 0-16-16t16-16z";
  _exports.pathData = pathData;
  const ltr = false;
  _exports.ltr = ltr;
  const accData = null;
  _exports.accData = accData;
  const collection = "SAP-icons";
  const packageName = "@ui5/webcomponents-icons";
  (0, _Icons.registerIcon)(name, {
    pathData,
    ltr,
    collection,
    packageName
  });
  var _default = "journey-arrive";
  _exports.default = _default;
});