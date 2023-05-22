sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "excel-attachment";
  const pathData = "M512 384H192V160h320v224zM0 480V128L128 0h224q13 0 22.5 9t9.5 23v96h-32V32H160v96q0 14-9.5 23t-23.5 9H32v320h320v-64h32v64q0 14-9 23t-23 9H32q-14 0-23-9t-9-23zm224-193v65h65v-65h-65zm192 65h64v-65h-64v65zm-192-97h65v-63h-65v63zm97 97h63v-65h-63v65zm159-97v-63h-64v63h64zm-159 0h63v-63h-63v63z";
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
  var _default = "SAP-icons-v4/excel-attachment";
  _exports.default = _default;
});