sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "data";
  const pathData = "M320 0l128 128v352q0 14-9.5 23t-23.5 9H95q-14 0-22.5-9T64 480V32q0-14 9-23t23-9h224zm96 480V160h-96q-14 0-23-9t-9-23V32H96l-1 448h321z";
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
  var _default = "tnt-v2/data";
  _exports.default = _default;
});