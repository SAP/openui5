sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "outbound-delivery-inactive";
  const pathData = "M256 0c141 0 256 115 256 256 0 140-115 255-256 255C116 511 1 396 1 256 1 115 116 0 256 0zm0 460c113 0 205-92 205-204 0-113-92-205-205-205-112 0-204 92-204 205 0 112 92 204 204 204z";
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
  var _default = "business-suite-v1/outbound-delivery-inactive";
  _exports.default = _default;
});