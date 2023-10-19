sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "screen-split-one";
  const pathData = "M422 32q38 0 64 26t26 64v268q0 38-26 64t-64 26H90q-38 0-64-26T0 390V122q0-38 26-64t64-26h332zM51 390q0 17 11 28t28 11h38V83H90q-17 0-28 11t-11 28v268zm410-268q0-17-11-28t-28-11H179v346h243q17 0 28-11t11-28V122z";
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
  var _default = "SAP-icons-v5/screen-split-one";
  _exports.default = _default;
});