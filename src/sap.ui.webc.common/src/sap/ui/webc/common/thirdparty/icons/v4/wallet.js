sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "wallet";
  const pathData = "M32 128h32V64q0-13 9-22.5T96 32h128q13 0 22.5 9.5T256 64h96q13 0 22.5 9.5T384 96v32h32q13 0 22.5 9.5T448 160v64q26 0 45 19t19 45v32q0 26-19 45t-45 19v64q0 14-9.5 23t-22.5 9H32q-14 0-23-9t-9-23V160q0-13 9-22.5t23-9.5zm0 320h384v-64h-64q-27 0-45.5-19T288 320v-32q0-26 18.5-45t45.5-19h64v-64H32v288zm288-128q0 14 9 23t23 9h96q13 0 22.5-9t9.5-23v-32q0-13-9.5-22.5T448 256h-96q-14 0-23 9.5t-9 22.5v32zm-96-192V64H96v64h128zm128 0V96h-96v32h96zm0 176q0-16 16-16 6 0 11 4.5t5 11.5-5 11.5-11 4.5q-16 0-16-16z";
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
  var _default = "SAP-icons-v4/wallet";
  _exports.default = _default;
});