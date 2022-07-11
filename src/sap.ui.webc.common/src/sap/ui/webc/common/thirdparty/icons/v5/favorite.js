sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "favorite";
  const pathData = "M1 210q4-15 21-18l146-21 65-131q6-14 23-14t23 14l65 131 146 21q17 3 21 18 1 2 1 7 0 11-8 19L399 338l25 144v3q0 15-11 22-7 5-15 5-6 0-11-3l-131-68-131 68q-4 3-11 3-8 0-16-5-10-7-10-22v-3l25-144L8 236q-8-8-8-19 0-5 1-7z";
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
  var _default = "favorite";
  _exports.default = _default;
});