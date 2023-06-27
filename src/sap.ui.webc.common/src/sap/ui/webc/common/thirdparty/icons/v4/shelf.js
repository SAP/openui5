sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "shelf";
  const pathData = "M64 512V32q0-14 9-23t23-9h320q13 0 22.5 9t9.5 23v480h-32v-96H96v96H64zm32-128h320v-96H96v96zm0-256h320V32H96v96zm0 32v96h320v-96H96zm112 32h96q16 0 16 16t-16 16h-96q-16 0-16-16t16-16zm0 128h96q16 0 16 16t-16 16h-96q-16 0-16-16t16-16zm0-256h96q16 0 16 16t-16 16h-96q-16 0-16-16t16-16z";
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
  var _default = "SAP-icons-v4/shelf";
  _exports.default = _default;
});