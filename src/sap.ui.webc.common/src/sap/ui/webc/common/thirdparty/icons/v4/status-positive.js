sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "status-positive";
  const pathData = "M399 32q35 0 58 24t23 56v289q0 33-23 56t-58 23H111q-33 0-56-23t-23-56V112q0-16 6-30.5T55 56t25-17.5 31-6.5h288zm17 74q0-4-3-7.5T403 95H107q-5 0-8 3.5t-3 7.5v299q0 11 11 11h296q3 0 8-1.5t5-9.5V106z";
  _exports.pathData = pathData;
  const ltr = false;
  _exports.ltr = ltr;
  const accData = null;
  _exports.accData = accData;
  const collection = "SAP-icons";
  const packageName = "@ui5/webcomponents-icons";
  (0, _Icons.registerIcon)(name, {
    pathData,
    ltr,
    collection,
    packageName
  });
  var _default = "status-positive";
  _exports.default = _default;
});