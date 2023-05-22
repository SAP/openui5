sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "face-neutral";
  const pathData = "M256 0c132 0 240 108 240 240S388 480 256 480 16 372 16 240 124 0 256 0zm192 240c0-106-86-192-192-192S64 134 64 240s86 192 192 192 192-86 192-192zm-276-24c-20 0-36-16-36-36s16-36 36-36 36 16 36 36-16 36-36 36zm132-36c0-20 16-36 36-36s36 16 36 36-16 36-36 36-36-16-36-36zM184 288h144c14 0 24 10 24 24s-10 24-24 24H184c-14 0-24-10-24-24s10-24 24-24z";
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
  var _default = "business-suite-v2/face-neutral";
  _exports.default = _default;
});