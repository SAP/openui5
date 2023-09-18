sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "table-view";
  const pathData = "M390 32q38 0 64 26t26 64v268q0 38-26 64t-64 26H122q-38 0-64-26t-26-64V122q0-38 26-64t64-26h268zm-89 128V83h-90v77h90zm128-38q0-17-11-28t-28-11h-38v77h77v-38zM122 83q-17 0-28 11t-11 28v38h77V83h-38zm179 218v-90h-90v90h90zm-218 0h77v-90H83v90zm269 0h77v-90h-77v90zm-141 51v77h90v-77h-90zM83 390q0 17 11 28t28 11h38v-77H83v38zm307 39q17 0 28-11t11-28v-38h-77v77h38z";
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
  var _default = "SAP-icons-v5/table-view";
  _exports.default = _default;
});