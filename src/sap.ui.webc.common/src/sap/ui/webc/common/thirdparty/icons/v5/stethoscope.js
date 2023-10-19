sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "stethoscope";
  const pathData = "M512 256q0 18-9 32.5T480 311v41q0 33-12.5 62T433 465t-51 34.5-62 12.5-62-12.5-51-34.5-34.5-51-12.5-62v-33q-34-3-63-18t-50.5-38-34-54T0 144V26Q0 15 7.5 7.5T26 0h44q11 0 18.5 7.5T96 26t-7.5 18T70 51H51v93q0 26 10 48.5T88 232t39.5 27 48.5 10 48.5-10 39.5-27 27-39.5 10-48.5V51h-19q-11 0-18.5-7T256 26t7.5-18.5T282 0h44q11 0 18.5 7.5T352 26v118q0 32-11 60.5T311.5 256 267 294.5 211 316v36q0 22 8.5 42t23.5 35 35 23.5 42 8.5q23 0 42.5-8.5T397 429t23.5-35 8.5-42v-35q-20-6-32.5-23T384 256q0-26 19-45t45-19 45 19 19 45z";
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
  var _default = "SAP-icons-v5/stethoscope";
  _exports.default = _default;
});