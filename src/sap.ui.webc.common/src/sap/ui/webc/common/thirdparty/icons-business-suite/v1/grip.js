sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "grip";
  const pathData = "M365 60h-64V-4h64v64zm-192 0V-4h64v64h-64zm0 113v-64h64v64h-64zm192 0h-64v-64h64v64zm-64 48h64v64h-64v-64zm-64 64h-64v-64h64v64zm64 47h64v64h-64v-64zm-128 0h64v64h-64v-64zm192 176h-64v-64h64v64zm-128 0h-64v-64h64v64z";
  _exports.pathData = pathData;
  const ltr = false;
  _exports.ltr = ltr;
  const accData = null;
  _exports.accData = accData;
  const collection = "business-suite-v1";
  const packageName = "@ui5/webcomponents-icons-business-suite";
  (0, _Icons.registerIcon)(name, {
    pathData,
    ltr,
    collection,
    packageName
  });
  var _default = "business-suite-v1/grip";
  _exports.default = _default;
});