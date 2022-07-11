sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "screen-split-three";
  const pathData = "M435 21q32 0 54.5 22.5T512 98v307q0 32-22.5 54T435 481H77q-32 0-54-22T1 405V98q0-32 22-54.5T77 21h358zM205 72v358h102V72H205zM52 405q0 25 25 25h77V72H77q-11 0-18 7.5T52 98v307zM461 98q0-11-7.5-18.5T435 72h-77v358h77q11 0 18.5-7t7.5-18V98z";
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
  var _default = "screen-split-three";
  _exports.default = _default;
});