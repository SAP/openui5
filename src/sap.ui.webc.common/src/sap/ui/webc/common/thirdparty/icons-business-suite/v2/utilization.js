sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "utilization";
  const pathData = "M64 192v240h384V264h-73v97c0 13-9 23-23 23h-96c-14 0-24-10-24-23v-73h-73c-13 0-22-10-22-24l-2-72H64zm432 48v216c0 7-3 13-7 17s-11 7-17 7H40c-13 0-24-11-24-24V24C16 11 27 0 40 0c14 0 24 11 24 24v120h95c14 0 25 10 25 24v72h72c13 0 24 11 24 24v73h48v-97c0-13 11-24 24-24h120c13 0 24 11 24 24z";
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
  var _default = "business-suite-v2/utilization";
  _exports.default = _default;
});