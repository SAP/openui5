sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "status-negative";
  const pathData = "M416 64l64-64 32 32-64 64zM0 32L32 0l64 64-32 32zm64 224q0-40 15-75t41-61 61-41 75-15 75 15 61 41 41 61 15 75-15 75-41 61-61 41-75 15-75-15-61-41-41-61-15-75zm64 0q0 26 10 49.5t27.5 41 41 27.5 49.5 10 49.5-10 41-27.5 27.5-41 10-49.5-10-49.5-27.5-41-41-27.5-49.5-10q-41 0-73 23-20 12-32 32-23 32-23 73zm288 192l32-32 64 64-32 32zM64 416l32 32-64 64-32-32z";
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
  var _default = "status-negative";
  _exports.default = _default;
});