sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "arrow-left";
  const pathData = "M454 198q26 0 26 26t-26 26H120l86 87q8 8 8 18 0 9-8 19-7 7-18 7t-18-7L42 245q-4-4-7-8.5T32 224q0-8 3-13t7-8L170 74q7-7 18-7t18 7q8 10 8 19 0 10-8 18l-86 87h334z";
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
  var _default = "arrow-left";
  _exports.default = _default;
});