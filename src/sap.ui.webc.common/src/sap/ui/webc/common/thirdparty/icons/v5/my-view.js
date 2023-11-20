sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "my-view";
  const pathData = "M422 0q38 0 64 26t26 64v236q0 38-26 64t-64 26h-81l11 45h38q11 0 18.5 7t7.5 18-7.5 18.5T390 512H122q-11 0-18.5-7.5T96 486t7.5-18 18.5-7h38l9-45H90q-38 0-64-26T0 326V90q0-38 26-64T90 0h332zm39 90q0-17-11-28t-28-11H90q-17 0-28 11T51 90v236q0 17 11 28t28 11h332q17 0 28-11t11-28V90zm-253 54q0-22 13-35t35-13 35 13 13 35-13 35-35 13-35-13-13-35zm144 145q0 14-7.5 22.5T326 320H186q-11 0-18.5-8.5T160 289q0-25 20.5-45t49.5-20h52q29 0 49.5 20t20.5 45zm-63 127h-68l-9 45h87z";
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
  var _default = "SAP-icons-v5/my-view";
  _exports.default = _default;
});