sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "system-exit";
  const pathData = "M256 1q53 0 99.5 20T437 76t55 81.5 20 99.5q0 52-20 98.5T437 437t-81.5 55-99.5 20q-52 0-98.5-20T76 437t-55-81.5T1 257q0-53 20-99.5T76 76t81.5-55T256 1zm0 460q42 0 79.5-16t65.5-44 44-65 16-79-16-79.5-44-65.5-65.5-44T256 52t-79 16-65 44-44 65.5T52 257t16 79 44 65 65 44 79 16zm95-248q8 8 8 18t-8 18-18 8-18-8l-59-59-58 59q-8 8-18 8t-18-8-8-18 8-18l76-76q8-8 18-8t18 8zm0 103q8 8 8 17.5t-8 17.5-18 8-18-8l-59-58-58 58q-8 8-18 8t-18-8-8-17.5 8-17.5l76-77q8-8 18-8t18 8z";
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
  var _default = "system-exit";
  _exports.default = _default;
});