sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "play";
  const pathData = "M256 2q53 0 99.5 20T437 77t55 81 20 99-20 99.5-55 81.5-81.5 55-99.5 20q-52 0-98.5-20T76 438t-55-81.5T1 257t20-99 55-81 81.5-55T256 2zm0 459q42 0 79.5-16t65.5-44 44-65 16-79-16-79-44-65-65.5-44T256 53t-79 16-65 44-44 65-16 79 16 79 44 65 65 44 79 16zm92-224q11 9 11 20t-11 20l-102 77q-5 4-12.5 5.5T221 357q-6-4-11-9.5t-5-13.5V180q0-14 16-23 5-4 13-2.5t12 5.5z";
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
  var _default = "play";
  _exports.default = _default;
});