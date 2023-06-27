sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "information";
  const pathData = "M0 256q0-53 20.5-100t55-81.5T157 20t99-20q54 0 100.5 20t81 55 54.5 81.5 20 99.5q0 54-20 100.5t-54.5 81T356 492t-100 20q-54 0-100.5-20t-81-55T20 355.5 0 256zm192 112v33h128v-33h-32V215q0-6-7-6h-88v31h32v128h-33zm34-201q14 11 30 11 17 0 29.5-11.5T298 138q0-19-13-31-12-12-29-12-19 0-30.5 12.5T214 138q0 17 12 29z";
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
  var _default = "SAP-icons-v4/information";
  _exports.default = _default;
});