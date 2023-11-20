sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "print";
  const pathData = "M454 96q24 0 41 17t17 41v172q0 24-17 41t-41 17h-38v102q0 11-7.5 18.5T390 512H122q-11 0-18.5-7.5T96 486V384H58q-24 0-41-17T0 326V154q0-24 17-41t41-17h38V26q0-11 7.5-18.5T122 0h268q11 0 18.5 7.5T416 26v70h38zm-307 0h218V51H147v45zm314 58q0-7-7-7H58q-7 0-7 7v172q0 7 7 7h38v-51q0-11 7.5-18.5T122 256h268q11 0 18.5 7.5T416 282v51h38q7 0 7-7V154zm-70 18q13 1 19 9t6 17q0 10-6.5 18t-19.5 8-19.5-8-6.5-17q0-11 6.5-19t20.5-8zm-26 135H147v154h218V307z";
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
  var _default = "SAP-icons-v5/print";
  _exports.default = _default;
});