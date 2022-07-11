sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "responsive";
  const pathData = "M256.5 395v42h21q21 0 21 22 0 21-21 21h-128q-21 0-21-21 0-22 21-22h64v-42h-149q-27 0-45.5-18.5T.5 331V118Q.5 91 19 72.5T64.5 54h341q27 0 45.5 18.5t18.5 45.5v43q0 9-6 15t-16 6q-9 0-15-6t-6-15v-43q0-10-6-15.5t-15-5.5h-341q-21 0-21 21v213q0 21 21 21h213q21 0 21 22 0 9-5.5 15t-15.5 6h-21zm234-170q21 0 21 21v213q0 21-21 21h-128q-21 0-21-21V246q0-21 21-21h128zm-107 42v149h86V267h-86z";
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
  var _default = "responsive";
  _exports.default = _default;
});