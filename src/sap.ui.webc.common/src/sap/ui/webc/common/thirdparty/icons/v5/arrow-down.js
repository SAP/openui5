sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "arrow-down";
  const pathData = "M256.5 1q53 0 99 20t81 55 55 81.5 20 99.5q0 52-20 98.5t-55 81.5-81 55-99 20-99.5-20-81.5-55-55-81.5T.5 257q0-53 20-99.5t55-81.5T157 21t99.5-20zm0 460q42 0 79-16t65-44 44-65 16-79-16-79.5-44-65.5-65-44-79-16T177 68t-65.5 44-44 65.5-16 79.5 16 79 44 65 65.5 44 79.5 16zm58-248q8-8 18-8t18 8 8 18-8 18l-77 77q-8 8-17.5 8t-17.5-8l-77-77q-8-8-8-18t8-18 18-8 18 8l58 59z";
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
  var _default = "arrow-down";
  _exports.default = _default;
});