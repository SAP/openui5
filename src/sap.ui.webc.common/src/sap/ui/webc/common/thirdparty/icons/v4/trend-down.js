sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "trend-down";
  const pathData = "M448 448q0 13-9.5 22.5T416 480H193q-14 0-23.5-9.5T160 447q0-13 9.5-22.5T192 415l148 1L77 153q-9-9-9.5-16l-.5-7q0-12 10-22 9-9 22.5-9t22.5 9l263 263V224q0-14 8.5-23t20.5-9h6q12 0 20 8t8 20v228z";
  _exports.pathData = pathData;
  const ltr = false;
  _exports.ltr = ltr;
  const accData = null;
  _exports.accData = accData;
  const collection = "SAP-icons";
  const packageName = "@ui5/webcomponents-icons";
  (0, _Icons.registerIcon)(name, {
    pathData,
    ltr,
    collection,
    packageName
  });
  var _default = "trend-down";
  _exports.default = _default;
});