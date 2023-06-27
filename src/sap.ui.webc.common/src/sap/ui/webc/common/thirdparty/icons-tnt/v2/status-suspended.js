sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "status-suspended";
  const pathData = "M32 448V64q0-14 9-23t23-9h384q14 0 23 9t9 23v384q0 14-9 23t-23 9H64q-14 0-23-9t-9-23zm256-320v256h64V128h-64zM160 384h64V128h-64v256z";
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
  var _default = "tnt-v2/status-suspended";
  _exports.default = _default;
});