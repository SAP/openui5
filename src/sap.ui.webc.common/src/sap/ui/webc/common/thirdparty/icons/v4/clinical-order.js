sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "clinical-order";
  const pathData = "M64 480V128L192 0h224q14 0 23 9t9 23v448q0 14-8.5 23t-22.5 9H97q-14 0-23.5-9T64 480zm32 0h321l-1-448H224v96q0 14-9 23t-23 9H96v320zm64-160v-64h64v-64h64v64h64v64h-64v64h-64v-64h-64z";
  _exports.pathData = pathData;
  const ltr = false;
  _exports.ltr = ltr;
  const accData = null;
  _exports.accData = accData;
  const collection = "SAP-icons-v4";
  const packageName = "@ui5/webcomponents-icons";
  (0, _Icons.registerIcon)(name, {
    pathData,
    ltr,
    collection,
    packageName
  });
  var _default = "SAP-icons-v4/clinical-order";
  _exports.default = _default;
});