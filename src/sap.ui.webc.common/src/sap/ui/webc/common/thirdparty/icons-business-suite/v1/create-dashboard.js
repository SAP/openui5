sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "create-dashboard";
  const pathData = "M24 96l96-96h288v109h-32V32H152v96H56v352h320v-78h32v110H24V96zm320 189v-48h48v-48h48v48h48v48h-48v48h-48v-48h-48zm-32-29H88v-37h224v37zM88 292h224v37H88v-37zm224 110H88v-37h224v37z";
  _exports.pathData = pathData;
  const ltr = false;
  _exports.ltr = ltr;
  const accData = null;
  _exports.accData = accData;
  const collection = "business-suite-v1";
  const packageName = "@ui5/webcomponents-icons-business-suite";
  (0, _Icons.registerIcon)(name, {
    pathData,
    ltr,
    collection,
    packageName
  });
  var _default = "business-suite-v1/create-dashboard";
  _exports.default = _default;
});