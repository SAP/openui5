sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "navigation-up-arrow";
  const pathData = "M86.5 380q-9 9-22.5 9t-22.5-9q-10-10-10-23t10-23l193-197q4-2 5-3t2-1l1-1q1-1 2-1 6-2 11-2 2 0 3 .5t2 .5q4 0 6 1l7 4q1 1 1.5 1t1.5 1 2 1l192 196q10 10 10 23t-10 23q-9 9-22.5 9t-22.5-9l-154-155q-8-5-16-5t-16 5z";
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
  var _default = "navigation-up-arrow";
  _exports.default = _default;
});