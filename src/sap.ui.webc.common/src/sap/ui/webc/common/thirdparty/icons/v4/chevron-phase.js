sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "chevron-phase";
  const pathData = "M505 236q7 9 7 20.5t-7 19.5L403 404q-11 12-25 12H16q-10 0-13-6.5T0 399t3-9l92-114q7-8 7-19.5T95 236L3 122q-3-5-3-9t3-10.5T16 96h362q13 0 25 12zm-25 20L378 128H49l71 88q14 18 14 40.5T120 296l-71 88h329z";
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
  var _default = "chevron-phase";
  _exports.default = _default;
});