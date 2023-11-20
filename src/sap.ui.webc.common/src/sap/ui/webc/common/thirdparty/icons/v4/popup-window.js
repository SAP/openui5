sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "popup-window";
  const pathData = "M128 32q0-13 9.5-22.5T160 0h320q14 0 23 9.5t9 22.5v288q0 14-9 23t-23 9H160q-13 0-22.5-9t-9.5-23V32zm32 0v288h320V32H160zM32 64h64v32H32v320h448v-32h32v32q0 13-9 22.5t-23 9.5H32q-13 0-22.5-9.5T0 416V96q0-14 9.5-23T32 64zm96 432q0-7 5-11.5t11-4.5h224q16 0 16 16 0 6-4.5 11t-11.5 5H144q-6 0-11-5t-5-11z";
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
  var _default = "SAP-icons-v4/popup-window";
  _exports.default = _default;
});