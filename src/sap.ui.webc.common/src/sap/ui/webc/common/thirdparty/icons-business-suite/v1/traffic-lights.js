sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "traffic-lights";
  const pathData = "M176 426V6c0-4 2-6 7-6h179c4 0 6 2 6 6v420c0 4-2 6-6 6H183c-5 0-7-2-7-6zm41-339c0 31 24 54 55 54s54-23 54-54-23-55-54-55-55 24-55 55zm-73 41L48 32h96v96zm256 0V32h96zm-182 87c0 31 23 54 54 54s55-23 55-54-24-55-55-55-54 24-54 55zm-74 41l-96-96h96v96zm256 0v-96h96zm-182 86c0 31 23 55 54 55s55-24 55-55-24-54-55-54-54 23-54 54zm182-54h96l-96 96v-96zm-352 0h96v96zm182 176h84c4 0 6 2 6 6v36c0 4-2 6-6 6h-84c-4 0-6-2-6-6v-36c0-4 2-6 6-6z";
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
  var _default = "business-suite-v1/traffic-lights";
  _exports.default = _default;
});