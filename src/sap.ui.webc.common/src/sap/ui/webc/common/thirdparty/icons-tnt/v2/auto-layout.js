sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "auto-layout";
  const pathData = "M32 288V32h208v256H32zm240-64h208v256H272V224zM480 32v160H272V32h208zM32 320h208v160H32V320z";
  _exports.pathData = pathData;
  const ltr = false;
  _exports.ltr = ltr;
  const accData = null;
  _exports.accData = accData;
  const collection = "tnt-v2";
  const packageName = "@ui5/webcomponents-icons-tnt";
  (0, _Icons.registerIcon)(name, {
    pathData,
    ltr,
    collection,
    packageName
  });
  var _default = "tnt-v2/auto-layout";
  _exports.default = _default;
});