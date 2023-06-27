sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "copy";
  const pathData = "M32 192l96-96h224q13 0 22.5 9t9.5 23v352q0 14-9 23t-23 9H65q-14 0-23.5-9T32 480V192zm320 288V128H160v64q0 14-9.5 23t-23.5 9H65v256h287zM159 64l65-64h224q12 0 22 9t10 23v352q0 14-9 23t-23 9h-32v-32h32V32H256v32h-97zm-15 256h128q16 0 16 16 0 6-4.5 11t-11.5 5H144q-6 0-11-5t-5-11q0-7 5-11.5t11-4.5zm-16 80q0-7 5-11.5t11-4.5h128q16 0 16 16 0 6-4.5 11t-11.5 5H144q-6 0-11-5t-5-11z";
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
  var _default = "SAP-icons-v4/copy";
  _exports.default = _default;
});