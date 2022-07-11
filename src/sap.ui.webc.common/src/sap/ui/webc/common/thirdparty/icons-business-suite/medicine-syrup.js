sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "medicine-syrup";
  const pathData = "M64.5 224q0-23 8-39.5t24-32.5q27-24 64-24V96h-32q-14 0-23-9t-9-23V32q0-14 9-23t23-9h256q14 0 23 9t9 23v32q0 14-9 23t-23 9h-32v32q37 0 64 24 16 16 24 32.5t8 39.5v256q0 14-9 23t-23 9h-320q-14 0-23-9t-9-23V224zm64-160h256V32h-256v32zm288 416V224q0-26-19-45t-45-19h-32V96h-128v64h-32q-26 0-45 19t-19 45v256h320zm-256-192h64v-64h64v64h64v64h-64v64h-64v-64h-64v-64z";
  _exports.pathData = pathData;
  const ltr = false;
  _exports.ltr = ltr;
  const accData = null;
  _exports.accData = accData;
  const collection = "business-suite";
  const packageName = "@ui5/webcomponents-icons-business-suite";
  (0, _Icons.registerIcon)(name, {
    pathData,
    ltr,
    collection,
    packageName
  });
  var _default = "medicine-syrup";
  _exports.default = _default;
});