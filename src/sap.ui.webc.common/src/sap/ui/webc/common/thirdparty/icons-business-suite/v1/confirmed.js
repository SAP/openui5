sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "confirmed";
  const pathData = "M256 0c142 0 256 115 256 256 0 142-114 256-256 256C115 512 0 398 0 256 0 115 115 0 256 0zM32 256c0 124 100 224 224 224s224-100 224-224S380 32 256 32 32 132 32 256zm45 0c0-99 80-179 179-179s179 80 179 179-80 179-179 179S77 355 77 256zm109 0c0 39 31 70 70 70s71-32 70-71c0-38-31-69-69-69-39-1-71 31-71 70z";
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
  var _default = "business-suite-v1/confirmed";
  _exports.default = _default;
});