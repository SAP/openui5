sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "filter-fields";
  const pathData = "M32 48q0-6 5-11t11-5h160q7 0 11.5 5t4.5 11q0 16-16 16H48q-6 0-11-4.5T32 48zm32 48h384q14 0 23 9.5t9 22.5v64q0 14-9 23t-23 9H64q-13 0-22.5-9T32 192v-64q0-13 9.5-22.5T64 96zm0 96h384v-64H64v64zm-16 96h160q7 0 11.5 5t4.5 11q0 16-16 16H48q-6 0-11-4.5T32 304q0-6 5-11t11-5zm-16 96q0-13 9.5-22.5T64 352h384q14 0 23 9.5t9 22.5v64q0 14-9 23t-23 9H64q-13 0-22.5-9T32 448v-64zm32 0v64h384v-64H64z";
  _exports.pathData = pathData;
  const ltr = false;
  _exports.ltr = ltr;
  const accData = null;
  _exports.accData = accData;
  const collection = "SAP-icons";
  const packageName = "@ui5/webcomponents-icons";
  (0, _Icons.registerIcon)(name, {
    pathData,
    ltr,
    collection,
    packageName
  });
  var _default = "filter-fields";
  _exports.default = _default;
});