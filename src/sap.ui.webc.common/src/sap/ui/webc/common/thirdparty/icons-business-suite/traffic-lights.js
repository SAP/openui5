sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "traffic-lights";
  const pathData = "M176 426V6q0-6 7-6h179q6 0 6 6v420q0 6-6 6H183q-7 0-7-6zm41-339q0 23 16 38.5t39 15.5 38.5-15.5T326 87t-15.5-39T272 32t-39 16-16 39zM48 32h96v96zm352 0h96l-96 96V32zM218 215q0 23 15.5 38.5T272 269t39-15.5 16-38.5-16-39-39-16-38.5 16-15.5 39zM48 160h96v96zm352 0h96l-96 96v-96zM218 342q0 23 15.5 39t38.5 16 39-16 16-39-16-38.5-39-15.5-38.5 15.5T218 342zm278-54l-96 96v-96h96zm-352 0v96l-96-96h96zm86 176h84q6 0 6 6v36q0 6-6 6h-84q-6 0-6-6v-36q0-6 6-6z";
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
  var _default = "traffic-lights";
  _exports.default = _default;
});