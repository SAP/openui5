sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "receive-task";
  const pathData = "M480 96q14 0 23 9t9 23v320q0 13-9 22.5t-23 9.5H32q-13 0-22.5-9.5T0 448V128q0-14 9.5-23T32 96h448zM66 128l190 154 190-154H66zm414 16L256 324 32 144v280l131-131 24 24L56 448h401L326 317l23-24 131 131V144z";
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
  var _default = "tnt-v2/receive-task";
  _exports.default = _default;
});