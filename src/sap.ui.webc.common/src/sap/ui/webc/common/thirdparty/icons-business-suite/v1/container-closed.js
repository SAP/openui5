sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "container-closed";
  const pathData = "M64 32h384c17 0 32 15 32 32v384c0 19-15 32-32 32H64c-19 0-32-13-32-32V64c0-17 13-32 32-32zm0 32v384h176V64H64zm208 0v160h96v80h-32v-48h-64v192h176V64H272z";
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
  var _default = "business-suite-v1/container-closed";
  _exports.default = _default;
});