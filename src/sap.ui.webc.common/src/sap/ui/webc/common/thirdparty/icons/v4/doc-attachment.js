sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "doc-attachment";
  const pathData = "M1 480V128L129 0h224q13 0 22.5 9t9.5 23v64h-32V32H161v96q0 14-9.5 23t-23.5 9H33v320h320v-48h32v48q0 14-9 23t-23 9H33q-14 0-23-9t-9-23zm255-335l37 165 54-165h36l55 165 36-165h37l-55 220h-37l-53-165-55 165h-37l-55-220h37z";
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
  var _default = "doc-attachment";
  _exports.default = _default;
});