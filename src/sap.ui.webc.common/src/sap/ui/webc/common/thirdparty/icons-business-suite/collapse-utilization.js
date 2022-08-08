sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "collapse-utilization";
  const pathData = "M17 0h31v224h112v80h112v64h80v-96h144v208H17V0zm287 96l96-96 96 96h-48l-24-24v96h-48V72l-24 24h-48zm160 352V304h-80v96H240v-64H128v-80H48v192h416z";
  _exports.pathData = pathData;
  const ltr = false;
  _exports.ltr = ltr;
  const accData = null;
  _exports.accData = accData;
  const collection = "business-suite";
  const packageName = "@ui5/webcomponents-icons-business-suite";
  (0, _Icons.registerIcon)(name, {
    pathData,
    ltr,
    collection,
    packageName
  });
  var _default = "collapse-utilization";
  _exports.default = _default;
});