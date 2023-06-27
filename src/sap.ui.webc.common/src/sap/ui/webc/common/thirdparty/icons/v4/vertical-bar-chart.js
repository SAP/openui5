sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "vertical-bar-chart";
  const pathData = "M352 408V40q0-8 8-8h48q8 0 8 8v368q0 8-8 8h-48q-8 0-8-8zM224 168q0-8 8-8h48q8 0 8 8v240q0 8-8 8h-48q-8 0-8-8V168zM32 448h448v32H32v-32zm72-224h48q8 0 8 8v176q0 8-8 8h-48q-8 0-8-8V232q0-8 8-8z";
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
  var _default = "SAP-icons-v4/vertical-bar-chart";
  _exports.default = _default;
});