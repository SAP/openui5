sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "confirmed";
  const pathData = "M256 2c131 0 239 108 239 239S387 480 256 480 17 372 17 241 125 2 256 2zm0 430c105 0 191-86 191-191S361 50 256 50 65 136 65 241s86 191 191 191zm0-45c-80 0-146-66-146-146S176 96 256 96s145 65 145 145-65 146-145 146zm0-207c-35 0-61 26-61 61s26 61 61 61 61-26 61-61-26-61-61-61z";
  _exports.pathData = pathData;
  const ltr = false;
  _exports.ltr = ltr;
  const accData = null;
  _exports.accData = accData;
  const collection = "business-suite-v2";
  const packageName = "@ui5/webcomponents-icons-business-suite";
  (0, _Icons.registerIcon)(name, {
    pathData,
    ltr,
    collection,
    packageName
  });
  var _default = "business-suite-v2/confirmed";
  _exports.default = _default;
});