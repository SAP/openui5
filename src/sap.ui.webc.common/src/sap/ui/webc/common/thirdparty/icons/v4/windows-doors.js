sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "windows-doors";
  const pathData = "M0 0h256v512H0V0zm288 224V0h224v224H288zm-64 256V32H32v448h192zm96-384h64V32h-64v64zm96-64v64h64V32h-64zm0 160h64v-64h-64v64zm-96-64v64h64v-64h-64zM161 240q0-16 16-16t16 16-16 16-16-16z";
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
  var _default = "windows-doors";
  _exports.default = _default;
});