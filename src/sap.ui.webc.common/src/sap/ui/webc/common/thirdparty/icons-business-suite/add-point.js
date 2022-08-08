sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "add-point";
  const pathData = "M204 17q36 0 68 14t55.5 38 37.5 56 14 68-14 68-37.5 55.5T272 354t-68 14-68-14-56-37.5T42.5 261 29 193t13.5-68T80 69t56-38 68-14zm125 420v-36h73v-73h36v73h74v36h-74v73h-36v-73h-73z";
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
  var _default = "add-point";
  _exports.default = _default;
});