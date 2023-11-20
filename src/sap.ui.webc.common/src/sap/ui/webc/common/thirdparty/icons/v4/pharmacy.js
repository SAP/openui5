sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "pharmacy";
  const pathData = "M64 224q0-42 27-69t69-27V96h-32q-14 0-23-9t-9-23V32q0-14 9-23t23-9h256q14 0 23 9t9 23v32q0 14-9 23t-23 9h-32v32q42 0 69 27t27 69v256q0 14-9 23t-23 9H96q-14 0-23-9t-9-23V224zm32 0v256h320V224q0-26-19-45t-45-19h-32V96H192v64h-32q-26 0-45 19t-19 45zm64 64h64v-64h64v64h64v64h-64v64h-64v-64h-64v-64zM384 64V32H128v32h256z";
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
  var _default = "SAP-icons-v4/pharmacy";
  _exports.default = _default;
});