sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "screen-split-three";
  const pathData = "M435 31q32 0 54.5 22.5T512 108v297q0 32-22.5 54T435 481H77q-32 0-54-22T1 405V108q0-32 22-54.5T77 31h358zM205 82v348h102V82H205zM52 405q0 25 25 25h77V82H77q-11 0-18 7.5T52 108v297zm409-297q0-11-7.5-18.5T435 82h-77v348h77q11 0 18.5-7t7.5-18V108z";
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
  var _default = "SAP-icons-v5/screen-split-three";
  _exports.default = _default;
});