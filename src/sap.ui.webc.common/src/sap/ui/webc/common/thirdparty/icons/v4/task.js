sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "task";
  const pathData = "M64 480V96q0-14 9-23t23-9h67q4-12 14-20.5T200 33q8-15 23-24t33-9 32.5 9T311 33q14 2 23.5 10.5T349 64h67q13 0 22.5 9t9.5 23v384q0 14-9.5 23t-22.5 9H96q-14 0-23-9t-9-23zm32 0h320V96h-67q-1 7-11 20-10 12-25 12H199q-15 0-26-12-7-10-10-20H96v384zm63-182l23-26 49 49 97-120 24 24-121 145zm49-202h96q16 0 16-16t-16-16h-16q0-14-9.5-23T256 32q-14 0-23 9t-9 23h-16q-16 0-16 16t16 16z";
  _exports.pathData = pathData;
  const ltr = true;
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
  var _default = "SAP-icons-v4/task";
  _exports.default = _default;
});