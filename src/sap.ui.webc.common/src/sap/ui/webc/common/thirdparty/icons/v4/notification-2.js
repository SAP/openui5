sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "notification-2";
  const pathData = "M0 96q0-26 19-45t45-19h384q27 0 45.5 19T512 96v224q0 26-18.5 45T448 384h-32v75q0 10-6.5 15.5T395 480t-12-4l-79-92H64q-26 0-45-19T0 320V96zm64 256h256l64 80v-80h64q14 0 23-9t9-23V96q0-13-9-22.5T448 64H64q-13 0-22.5 9.5T32 96v224q0 14 9.5 23t22.5 9zm64-112q0-7 5-11.5t11-4.5h224q16 0 16 16 0 6-4.5 11t-11.5 5H144q-6 0-11-5t-5-11zm16-112h224q16 0 16 16 0 6-4.5 11t-11.5 5H144q-6 0-11-5t-5-11q0-7 5-11.5t11-4.5z";
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
  var _default = "SAP-icons-v4/notification-2";
  _exports.default = _default;
});