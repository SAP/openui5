sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "switch-views";
  const pathData = "M384 128q13 0 22.5 9.5T416 160v320q0 14-9.5 23t-22.5 9H160q-14 0-23-9t-9-23V160q0-13 9-22.5t23-9.5h224zm0 32H160v320h224V160zM32 352h64v32H32q-14 0-23-9t-9-23V32Q0 19 9 9.5T32 0h224q13 0 22.5 9.5T288 32H32v320zM480 64q13 0 22.5 9.5T512 96v320q0 14-9.5 23t-22.5 9h-32v-32h32V96H224q0-13 9-22.5t23-9.5h224z";
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
  var _default = "SAP-icons-v4/switch-views";
  _exports.default = _default;
});