sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "dropdown";
  const pathData = "M256.5 480q-11 0-19-8l-76-76q-8-8-8-18 0-11 7.5-18.5t18.5-7.5 18 7l59 59 58-59q7-7 18-7t18.5 7.5 7.5 18.5-7 18l-77 76q-8 8-18 8z";
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
  var _default = "SAP-icons-v5/dropdown";
  _exports.default = _default;
});