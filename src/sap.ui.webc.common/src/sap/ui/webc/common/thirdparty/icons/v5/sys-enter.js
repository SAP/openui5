sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "sys-enter";
  const pathData = "M256 0q53 0 99.5 20T437 75t55 81.5 20 99.5q0 52-20 98.5T437 436t-81.5 55-99.5 20q-52 0-98.5-20T76 436t-55-81.5T1 256q0-53 20-99.5T76 75t81.5-55T256 0zm0 460q42 0 79.5-16t65-44 43.5-65 16-79-16-79.5-43.5-65.5-65-44T256 51t-79 16-65 44-44 65.5T52 256t16 79 44 65 65 44 79 16zm84-299q8-8 18-8t18 8 8 18-8 18L223 350q-8 8-18 8t-18-8l-51-51q-8-8-8-18t8-18 18-8 18 8l33 33z";
  _exports.pathData = pathData;
  const ltr = true;
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
  var _default = "sys-enter";
  _exports.default = _default;
});