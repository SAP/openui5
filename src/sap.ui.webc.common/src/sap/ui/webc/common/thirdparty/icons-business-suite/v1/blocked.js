sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "blocked";
  const pathData = "M256 0c141 0 256 115 256 256 0 142-115 256-256 256C114 512 0 398 0 256 0 115 114 0 256 0zM145 100l267 268c23-32 36-69 36-112 0-107-85-192-192-192-43 0-80 13-111 36zM64 256c0 107 85 192 192 192 41 0 79-12 111-35L99 145c-23 32-35 70-35 111z";
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
  var _default = "business-suite-v1/blocked";
  _exports.default = _default;
});