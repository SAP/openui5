sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "card";
  const pathData = "M390 32q38 0 64 26t26 64v268q0 38-26 64t-64 26H122q-38 0-64-26t-26-64V122q0-38 26-64t64-26h268zm39 90q0-17-11-28t-28-11H122q-17 0-28 11t-11 28v268q0 17 11 28t28 11h268q17 0 28-11t11-28V122zM328 224q-17 0-28.5-11.5T288 184t11.5-28.5T328 144t28.5 11.5T368 184t-11.5 28.5T328 224zm53 123q3 4 3 11 0 11-7.5 18.5T358 384H154q-11 0-18.5-7.5T128 358q0-4 1-6l25-108q2-9 9.5-14.5T179 224q6 0 12 3t9 8l56 85 66-29q3-1 6.5-2t6.5-1q15 0 23 14z";
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
  var _default = "SAP-icons-v5/card";
  _exports.default = _default;
});