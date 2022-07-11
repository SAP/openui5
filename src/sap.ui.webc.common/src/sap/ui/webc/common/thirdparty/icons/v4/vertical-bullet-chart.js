sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "vertical-bullet-chart";
  const pathData = "M448 32v32H320V32h128zm-96 376V104q0-8 8-8h48q8 0 8 8v304q0 8-8 8h-48q-8 0-8-8zM192 127V96h128v31H192zm32 41q0-8 8-8h48q8 0 8 8v240q0 8-8 8h-48q-8 0-8-8V168zm-32 25v31H64v-31h128zm-88 64h48q8 0 8 8v143q0 8-8 8h-48q-8 0-8-8V265q0-8 8-8zM32 449h448v31H32v-31z";
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
  var _default = "vertical-bullet-chart";
  _exports.default = _default;
});