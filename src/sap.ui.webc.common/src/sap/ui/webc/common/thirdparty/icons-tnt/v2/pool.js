sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "pool";
  const pathData = "M112 0h288q13 0 22.5 9.5T432 32v448q0 14-9.5 23t-22.5 9H112q-14 0-23-9t-9-23V32q0-13 9-22.5T112 0zm160 480h128V64H272v416zm-160 0h128V64H112v416z";
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
  var _default = "tnt-v2/pool";
  _exports.default = _default;
});