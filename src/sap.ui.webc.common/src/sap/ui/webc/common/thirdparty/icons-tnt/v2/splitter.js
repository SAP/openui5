sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "splitter";
  const pathData = "M32 352V160q0-13 9-22.5t23-9.5h96q14 0 23 9t9 23v80h64V128q0-26 19-45t45-19h32q0-13 9-22.5t23-9.5h64q14 0 23 9t9 23v64q0 14-9.5 23t-22.5 9h-64q-13 0-22.5-9.5T352 128V96h-32q-14 0-23 9.5t-9 22.5v112h64v-16q0-13 9-22.5t23-9.5h64q14 0 23 9t9 23v64q0 14-9.5 23t-22.5 9h-64q-13 0-22.5-9.5T352 288v-16h-64v112q0 13 9 22.5t23 9.5h32v-32q0-13 9-22.5t23-9.5h64q14 0 23 9t9 23v64q0 14-9.5 23t-22.5 9h-64q-13 0-22.5-9.5T352 448h-32q-26 0-45-19t-19-45V272h-64v80q0 14-9.5 23t-22.5 9H64q-13 0-22.5-9.5T32 352zM448 64h-64v64h64V64zm-64 160v64h64v-64h-64zm0 224h64v-64h-64v64z";
  _exports.pathData = pathData;
  const ltr = false;
  _exports.ltr = ltr;
  const accData = null;
  _exports.accData = accData;
  const collection = "tnt-v2";
  const packageName = "@ui5/webcomponents-icons-tnt";
  (0, _Icons.registerIcon)(name, {
    pathData,
    ltr,
    collection,
    packageName
  });
  var _default = "tnt-v2/splitter";
  _exports.default = _default;
});