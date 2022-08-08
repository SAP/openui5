sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "navigation-right-arrow";
  const pathData = "M172 155q-9-11-9-22 0-13 9-22t22-9q12 0 21 9l124 124q10 9 10 22 0 12-10 22L215 403q-9 9-21 9-13 0-22-9-9-11-9-22 0-13 9-22l102-102z";
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
  var _default = "navigation-right-arrow";
  _exports.default = _default;
});