sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "switch-classes";
  const pathData = "M0 512v-64q0-27 10-50t27.5-40.5 41-27.5 49.5-10h32q-40 0-68-28t-28-68 28-68 68-28 68 28 28 68-28 68-68 28h32q27 0 50 10t40.5 27.5T310 398t10 50v64H0zm32-64v32h256v-32q0-40-28-68t-68-28h-64q-19 0-36.5 7.5t-31 20.5-21 30.5T32 448zM192 96V64h224q14 0 23 9t9 23v320q0 13-9 22.5t-23 9.5h-64v-32h64V96H192zM480 0q14 0 23 9t9 23v352h-32V32H256V0h224zM160 288q27 0 45.5-19t18.5-45q0-27-18.5-45.5T160 160q-26 0-45 18.5T96 224q0 26 19 45t45 19z";
  _exports.pathData = pathData;
  const ltr = false;
  _exports.ltr = ltr;
  const accData = null;
  _exports.accData = accData;
  const collection = "SAP-icons-v4";
  const packageName = "@ui5/webcomponents-icons";
  (0, _Icons.registerIcon)(name, {
    pathData,
    ltr,
    collection,
    packageName
  });
  var _default = "SAP-icons-v4/switch-classes";
  _exports.default = _default;
});