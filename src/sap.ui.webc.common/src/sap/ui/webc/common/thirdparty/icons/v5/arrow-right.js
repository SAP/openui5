sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "arrow-right";
  const pathData = "M392 198l-86-87q-8-8-8-18 0-9 8-19 7-7 18-7t18 7l128 129q4 3 7 8t3 13-3 12.5-7 8.5L342 373q-7 8-18 8t-18-8q-8-8-8-18t8-18l86-87H58q-26 0-26-26t26-26h334z";
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
  var _default = "arrow-right";
  _exports.default = _default;
});