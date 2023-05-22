sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "filter-fields";
  const pathData = "M64 96h384q14 0 23 9.5t9 22.5v64q0 14-9 23t-23 9H64q-13 0-22.5-9T32 192v-64q0-13 9.5-22.5T64 96zM32 384q0-13 9.5-22.5T64 352h384q14 0 23 9.5t9 22.5v64q0 14-9 23t-23 9H64q-13 0-22.5-9T32 448v-64zm32-192h384v-64H64v64zm0 192v64h384v-64H64zM32 48q0-6 5-11t11-5h160q7 0 11.5 5t4.5 11q0 16-16 16H48q-6 0-11-4.5T32 48zm16 240h160q7 0 11.5 5t4.5 11q0 16-16 16H48q-6 0-11-4.5T32 304q0-6 5-11t11-5z";
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
  var _default = "SAP-icons-v4/filter-fields";
  _exports.default = _default;
});