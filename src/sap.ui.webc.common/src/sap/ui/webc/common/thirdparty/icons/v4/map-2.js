sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "map-2";
  const pathData = "M32 64q0-13 9-22.5T64 32h384q13 0 22.5 9.5T480 64v384q0 14-9.5 23t-22.5 9H64q-14 0-23-9t-9-23V64zm416 384V64H64v384h384zM128 135V96l124 72-14 29zm124-39l28 14-14 29-29-14zm55 120q0-23 16-39.5t39-16.5 38.5 16.5T416 216q0 12-4 19l-51 86-50-86q-4-7-4-19zm-126 24l14-29 29 14-15 29zm-14 28l28 15-14 28-29-14zm43 58l14-29 29 14-15 29zm57 28l14-29 29 14-14 29zM96 416l42-90 29 14-38 76H96zm228-34l15-28 28 14-14 28z";
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
  var _default = "map-2";
  _exports.default = _default;
});