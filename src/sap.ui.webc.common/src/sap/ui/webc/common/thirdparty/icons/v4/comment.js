sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "comment";
  const pathData = "M32 224q0 14 9 23t23 9h64v32H64q-27 0-45.5-19T0 224V64q0-26 18.5-45T64 0h224q26 0 45 19t19 45v64h-32V64q0-14-9.5-23T288 32H64q-14 0-23 9t-9 23v160zm416-64q26 0 45 19t19 45v128q0 27-19 45.5T448 416v76q0 9-6.5 14.5T427 512t-13-4l-78-91-112-1q-26 0-45-18.5T160 352V224q0-26 19-45t45-19h224zm32 64q0-13-9.5-22.5T448 192H224q-14 0-23 9.5t-9 22.5v128q0 14 9 23t23 9l128 1 64 79v-80h32q13 0 22.5-9t9.5-23V224z";
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
  var _default = "SAP-icons-v4/comment";
  _exports.default = _default;
});