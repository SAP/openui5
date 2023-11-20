sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "direction-arrows";
  const pathData = "M135 128q11 0 18 7.5t7 18.5v204q0 11-8 18.5t-18 7.5-17-7L8 275q-8-8-8-19t8-19l109-102q7-7 18-7zm369 109q8 8 8 19t-8 19L395 377q-7 7-17 7t-18-7.5-8-18.5V154q0-12 8-19t19-7q9 0 16 7z";
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
  var _default = "SAP-icons-v5/direction-arrows";
  _exports.default = _default;
});