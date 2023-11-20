sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "post";
  const pathData = "M0 96q0-26 19-45t45-19h384q27 0 45.5 19T512 96v224q0 26-18.5 45T448 384h-32v75q0 10-6.5 15.5T395 480t-12-4l-79-91-240-1q-26 0-45-19T0 320V96zm32 0v224q0 14 9.5 23t22.5 9h256l64 80v-80h64q14 0 23-9t9-23V96q0-13-9-22.5T448 64H64q-13 0-22.5 9.5T32 96z";
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
  var _default = "SAP-icons-v4/post";
  _exports.default = _default;
});