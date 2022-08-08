sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "text";
  const pathData = "M466 1q14 0 22 8t8 22v60q0 14-8 22t-22 8-22-8-8-22V61H286v360h30q14 0 22 8t8 22-8 22-22 8H196q-14 0-22-8t-8-22 8-22 22-8h30V61H76v30q0 14-8 22t-22 8-22-8-8-22V31q0-14 8-22t22-8h420z";
  _exports.pathData = pathData;
  const ltr = false;
  _exports.ltr = ltr;
  const accData = null;
  _exports.accData = accData;
  const collection = "SAP-icons-v5";
  const packageName = "@ui5/webcomponents-icons";
  (0, _Icons.registerIcon)(name, {
    pathData,
    ltr,
    collection,
    packageName
  });
  var _default = "text";
  _exports.default = _default;
});