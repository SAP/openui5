sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "toaster-down";
  const pathData = "M384 154q0 26-26 26H154q-11 0-18.5-7t-7.5-19q0-11 7.5-18t18.5-7h204q26 0 26 25zM486 1q11 0 18.5 7t7.5 19v25q0 12-7.5 19T486 78v179q0 32-22 54t-55 22h-51q-25 0-25-25 0-26 25-26h51q26 0 26-25V78H77v179q0 11 7.5 18t18.5 7h51q25 0 25 26 0 25-25 25h-51q-33 0-55-22t-22-54V78Q1 78 1 52V27Q1 1 26 1h460zM231 425V257q0-26 25-26 11 0 18.5 7t7.5 19v168l33-33q8-8 18-8t18 8 8 18-8 18l-77 76q-8 8-18 8t-18-8l-76-76q-8-8-8-18t8-18 17.5-8 17.5 8z";
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
  var _default = "toaster-down";
  _exports.default = _default;
});