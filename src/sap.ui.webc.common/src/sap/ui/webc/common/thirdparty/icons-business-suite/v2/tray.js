sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "tray";
  const pathData = "M416 144l32 119c3 1 5 4 8 6 6 6 9 33 9 40v112c0 15-11 28-27 28H73c-16 0-26-12-26-28V309c0-7 3-34 8-40 1-2 4-4 7-5l32-120c2-16 16-28 32-28h257c16 0 30 12 33 28zm-276 24l-27 93h18c9 0 19 6 22 14 4 9 12 14 25 14h157c12 0 19-5 22-14 3-8 13-14 23-14h17l-28-93c0-3-3-5-6-5H146c-3 0-5 2-6 5zm254 232c16 0 23 1 23-23v-40H94v40c0 21 2 23 24 23h276z";
  _exports.pathData = pathData;
  const ltr = false;
  _exports.ltr = ltr;
  const accData = null;
  _exports.accData = accData;
  const collection = "business-suite-v2";
  const packageName = "@ui5/webcomponents-icons-business-suite";
  (0, _Icons.registerIcon)(name, {
    pathData,
    ltr,
    collection,
    packageName
  });
  var _default = "business-suite-v2/tray";
  _exports.default = _default;
});