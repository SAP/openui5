sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "pie-chart";
  const pathData = "M261 0q52 0 98 20t80 55 53.5 81.5T512 256t-20 100-55 81.5-81.5 54.5T255 512q-55 0-101.5-20.5T73 436t-53.5-80.5T0 259q0-54 21-101t57-82.5T161.5 20 261 0zm176 160q-24-46-67-74.5T275 52v172zM224 54q-37 6-69 24t-55 45-36 61-13 72 13 72 36 61 55 45 69 24V54zm51 406q40-4 74-21.5t59-44.5 39-62.5 14-75.5q0-26-6-48l-180 71v181z";
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
  var _default = "SAP-icons-v5/pie-chart";
  _exports.default = _default;
});