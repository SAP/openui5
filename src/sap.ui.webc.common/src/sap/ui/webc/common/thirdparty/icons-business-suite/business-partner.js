sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "business-partner";
  const pathData = "M288 480h192v-32q0-40-28-68t-68-28h-32q-38 0-64 25v-39q29-18 64-18h16q-33 0-56.5-23.5T288 240t23.5-56.5T368 160q34 0 57 23.5t23 56.5-23 56.5-57 23.5h16q27 0 50 10t40.5 27.5T502 398t10 50v64H288v-32zM0 448q0-27 10-50t27.5-40.5T78 330t50-10h16q-34 0-57-23.5T64 240t23-56.5 57-23.5q33 0 56.5 23.5T224 240t-23.5 56.5T144 320h16q36 0 64 18v39q-26-25-64-25h-32q-40 0-68 28t-28 68v32h192v32H0v-64zm368-160q20 0 34-14t14-34-14-34-34-14-34 14-14 34 14 34 34 14zM96 240q0 20 14 34t34 14 34-14 14-34-14-34-34-14-34 14-14 34z";
  _exports.pathData = pathData;
  const ltr = false;
  _exports.ltr = ltr;
  const accData = null;
  _exports.accData = accData;
  const collection = "business-suite";
  const packageName = "@ui5/webcomponents-icons-business-suite";
  (0, _Icons.registerIcon)(name, {
    pathData,
    ltr,
    collection,
    packageName
  });
  var _default = "business-partner";
  _exports.default = _default;
});