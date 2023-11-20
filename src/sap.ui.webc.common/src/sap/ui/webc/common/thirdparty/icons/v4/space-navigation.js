sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "space-navigation";
  const pathData = "M256.5 328q30 0 51-21t21-51-21-51-51-21-51 21-21 51 21 51 51 21zm120-72q0 44-27.5 76.5T280.5 373v115q0 10-7 17t-17 7-17-7-7-17V373q-42-8-69-40.5t-27-76.5 27-76.5 69-41.5V24q0-10 7-17t17-7 17 7 7 17v114q41 9 68.5 41.5t27.5 76.5z";
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
  var _default = "SAP-icons-v4/space-navigation";
  _exports.default = _default;
});