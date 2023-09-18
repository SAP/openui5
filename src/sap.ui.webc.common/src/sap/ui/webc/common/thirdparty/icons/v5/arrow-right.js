sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "arrow-right";
  const pathData = "M331 409q-7 7-17 7-11 0-18.5-7.5T288 390q0-10 8-18l95-90H58q-11 0-18.5-7.5T32 256t7.5-18.5T58 230h333l-95-90q-8-8-8-18 0-11 7.5-18.5T314 96q10 0 17 7l141 134q8 8 8 19 0 12-8 18z";
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
  var _default = "SAP-icons-v5/arrow-right";
  _exports.default = _default;
});