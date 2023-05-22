sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "personnel-view";
  const pathData = "M352 512H32v-64q0-26 10-49.5t27.5-41 41-27.5 49.5-10h32q-40 0-68-28t-28-68 28-68 68-28 68 28 28 68-28 68-68 28h32q26 0 49.5 10t41 27.5 27.5 41 10 49.5v64zM64 448v32h256v-32q0-40-28-68t-68-28h-64q-40 0-68 28t-28 68zm64-416h320q14 0 23 9t9 23v352q0 14-9 23t-23 9h-64v-32h64V64H128v32H96V64q0-14 9-23t23-9zm0 192q0 26 19 45t45 19 45-19 19-45-19-45-45-19-45 19-19 45z";
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
  var _default = "SAP-icons-v4/personnel-view";
  _exports.default = _default;
});