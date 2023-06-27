sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "spill";
  const pathData = "M112 160V0h32l16 32h272c28 0 64 1 64 48s-36 48-64 48H160l-16 32h-32zM64 293c0-10 16-38 48-85 32 47 48 75 48 85 0 20-17 43-48 43-33 0-48-23-48-43zm-46 75h14c17 0 23 3 38 32s21 32 42 32 27-3 48-32c20-31 27-32 32-32h304v144H18V368z";
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
  var _default = "business-suite-v1/spill";
  _exports.default = _default;
});