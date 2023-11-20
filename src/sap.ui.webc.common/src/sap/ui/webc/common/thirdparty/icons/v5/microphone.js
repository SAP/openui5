sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "microphone";
  const pathData = "M256 320q-33 0-56.5-23.5T176 240V80q0-33 23.5-56.5T256 0t56.5 23.5T336 80v160q0 33-23.5 56.5T256 320zm-29-80q0 12 8.5 20.5T256 269t20.5-8.5T285 240V80q0-12-8.5-20.5T256 51t-20.5 8.5T227 80v160zm195-48q11 0 18.5 7.5T448 218q0 36-12.5 69t-35 60-53 44.5T282 414v72q0 11-7.5 18.5T256 512t-18.5-7.5T230 486v-72q-35-5-65.5-23t-53-44.5-35-59.5T64 218q0-11 7.5-18.5T90 192t18 7.5 7 18.5q0 28 11 55t30.5 47 45 32.5T256 365t54.5-12.5 45-32.5 30.5-47 11-55q0-11 7-18.5t18-7.5z";
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
  var _default = "SAP-icons-v5/microphone";
  _exports.default = _default;
});