sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "attachment-photo";
  const pathData = "M225 99h287v313H225V99zm32 253h223V128H257v224zM0 480V128L128 0h224q13 0 22.5 9t9.5 23v32h-32V32H160v96q0 14-9.5 23t-23.5 9H32v320h320v-32h32v32q0 14-9 23t-23 9H32q-14 0-23-9t-9-23zm315-213q0-19 18-19h41q-12 0-22-7-15-12-15-29t10.5-26.5T374 176q9 0 10 1 11 3 19 11.5t8 23.5-11 25.5-26 10.5h45q17 0 17 19v53H315v-53z";
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
  var _default = "SAP-icons-v4/attachment-photo";
  _exports.default = _default;
});