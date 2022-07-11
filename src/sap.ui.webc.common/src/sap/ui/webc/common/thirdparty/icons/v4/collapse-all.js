sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "collapse-all";
  const pathData = "M267 204q6 6 6 12 0 5-6 11-5 5-11 5-5 0-11-5l-85-86v259q0 17-16 17t-16-17V139l-87 88q-5 5-11 5t-12-5q-5-6-5-11 0-6 5-12l102-103q10-10 23-10t22 10zM496 96q16 0 16 15 0 7-4.5 12t-11.5 5H336q-7 0-11.5-5t-4.5-12q0-15 16-15h160z";
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
  var _default = "collapse-all";
  _exports.default = _default;
});