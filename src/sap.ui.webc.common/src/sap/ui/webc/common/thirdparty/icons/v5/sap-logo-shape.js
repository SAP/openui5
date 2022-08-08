sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "sap-logo-shape";
  const pathData = "M509.476 113q8 17-5 32l-227 231q-10 8-20 8h-227q-13 0-21-7.5t-8-20.5V125q0-13 8-21t21-8h454q8 0 15.5 4.5t9.5 12.5z";
  _exports.pathData = pathData;
  const ltr = true;
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
  var _default = "sap-logo-shape";
  _exports.default = _default;
});