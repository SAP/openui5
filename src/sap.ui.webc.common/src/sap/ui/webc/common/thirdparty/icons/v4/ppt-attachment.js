sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "ppt-attachment";
  const pathData = "M256 128h160q13 0 22.5 9.5T448 160v32h32q13 0 22.5 9.5T512 224v128q0 14-9.5 23t-22.5 9H320q-14 0-23-9t-9-23v-32h-32q-14 0-23-9t-9-23V160q0-13 9-22.5t23-9.5zM0 480V128L128 0h224q13 0 22.5 9t9.5 23v64h-32V32H160v96q0 14-9.5 23t-23.5 9H32v320h320v-48h32v48q0 14-9 23t-23 9H32q-14 0-23-9t-9-23zm320-128h160V224H320v128zm96-192H256v128h32v-64q0-13 9-22.5t23-9.5h96v-32z";
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
  var _default = "SAP-icons-v4/ppt-attachment";
  _exports.default = _default;
});