sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "map-fill";
  const pathData = "M256 0q44 0 82 16t66 44 44 65.5 16 79.5q0 44-17 88t-44.5 83.5T341 449t-68 57q-5 4-9 5t-8 1-8-1-9-5q-34-24-68-57t-61.5-72.5T65 293t-17-88q0-42 16-79.5T108 60t66-44 82-16zm0 118q-40 0-66.5 26.5T163 211t26.5 66.5T256 304t66.5-26.5T349 211t-26.5-66.5T256 118z";
  _exports.pathData = pathData;
  const ltr = false;
  _exports.ltr = ltr;
  const accData = null;
  _exports.accData = accData;
  const collection = "SAP-icons-v5";
  const packageName = "@ui5/webcomponents-icons";
  (0, _Icons.registerIcon)(name, {
    pathData,
    ltr,
    collection,
    packageName
  });
  var _default = "SAP-icons-v5/map-fill";
  _exports.default = _default;
});