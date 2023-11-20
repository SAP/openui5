sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "accessibility";
  const pathData = "M256 0q53 0 99.5 20T437 75t55 81.5 20 99.5-20 99.5-55 81.5-81.5 55-99.5 20-99.5-20T75 437t-55-81.5T0 256t20-99.5T75 75t81.5-55T256 0zm0 461q42 0 79.5-16t65.5-44 44-65.5 16-79.5-16-79.5-44-65.5-65.5-44T256 51t-79.5 16-65.5 44-44 65.5T51 256t16 79.5 44 65.5 65.5 44 79.5 16zm0-315q-14 0-23-9t-9-23q0-13 9-22.5t23-9.5 23 9.5 9 22.5q0 14-9 23t-23 9zm87-2q9-5 15-5 11 0 18.5 7.5T384 165q0 12-12 20.5t-27.5 14T313 208t-25 5v41l49 127q2 3 2 9 0 11-7 18.5t-18 7.5q-8 0-14.5-4t-9.5-12l-31-80h-6l-31 80q-6 16-24 16-10 0-17.5-7.5T173 390q0-6 2-9l49-128v-40q-8-1-24-4t-32-9-28-14.5-12-20.5q0-11 7.5-18.5T154 139q3 0 6.5 1t10.5 5q35 19 85 19 23 0 46.5-5.5T343 144z";
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
  var _default = "SAP-icons-v5/accessibility";
  _exports.default = _default;
});