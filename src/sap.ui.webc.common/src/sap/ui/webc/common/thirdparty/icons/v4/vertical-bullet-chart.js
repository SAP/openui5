sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "vertical-bullet-chart";
  const pathData = "M352 408V104q0-8 8-8h48q8 0 8 8v304q0 8-8 8h-48q-8 0-8-8zM224 168q0-8 8-8h48q8 0 8 8v240q0 8-8 8h-48q-8 0-8-8V168zM32 449h448v31H32v-31zm72-192h48q8 0 8 8v143q0 8-8 8h-48q-8 0-8-8V265q0-8 8-8zM448 32v32H320V32h128zm-256 95V96h128v31H192zm0 66v31H64v-31h128z";
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
  var _default = "SAP-icons-v4/vertical-bullet-chart";
  _exports.default = _default;
});