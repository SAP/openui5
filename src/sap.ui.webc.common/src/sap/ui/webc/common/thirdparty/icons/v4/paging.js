sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "paging";
  const pathData = "M480 448q14 0 23 9t9 23q0 13-9 22.5t-23 9.5H32q-13 0-22.5-9.5T0 480q0-14 9.5-23t22.5-9h448zm0-224q14 0 23 9t9 23q0 13-9 22.5t-23 9.5H32q-13 0-22.5-9.5T0 256q0-14 9.5-23t22.5-9h448zM32 64q-13 0-22.5-9.5T0 32Q0 18 9.5 9T32 0h448q14 0 23 9t9 23q0 13-9 22.5T480 64H32z";
  _exports.pathData = pathData;
  const ltr = false;
  _exports.ltr = ltr;
  const accData = null;
  _exports.accData = accData;
  const collection = "SAP-icons-v4";
  const packageName = "@ui5/webcomponents-icons";
  (0, _Icons.registerIcon)(name, {
    pathData,
    ltr,
    collection,
    packageName
  });
  var _default = "SAP-icons-v4/paging";
  _exports.default = _default;
});