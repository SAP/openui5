sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "screen-split-one";
  const pathData = "M435 32q32 0 54.5 22.5T512 109v296q0 32-22.5 54T435 481H77q-32 0-54-22T1 405V109q0-32 22-54.5T77 32h358zM52 405q0 25 25 25h51V84H77q-25 0-25 25v296zm408-296q0-25-25-25H179v346h256q25 0 25-25V109z";
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
  var _default = "SAP-icons-v5/screen-split-one";
  _exports.default = _default;
});