sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "map-fill";
  const pathData = "M256 0q98 0 145 62 47 63 47 116 0 46-36 113-41 75-156 221Q121 326 90 271q-26-47-26-94 0-65 48.5-121T256 0zm-96 192q0 44 26 70t70 26q43 0 69.5-26t26.5-70-26.5-70T256 96q-44 0-70 26t-26 70z";
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
  var _default = "SAP-icons-v4/map-fill";
  _exports.default = _default;
});