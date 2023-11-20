sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "suitcase";
  const pathData = "M0 192q0-26 19-45t45-19h96V96q0-26 19-45t45-19h64q27 0 45.5 19T352 96v32h96q27 0 45.5 19t18.5 45v224q0 26-18.5 45T448 480H64q-26 0-45-19T0 416V192zm384 256V160H128v288h256zm32 0h32q14 0 23-9.5t9-22.5V192q0-14-9-23t-23-9h-32v288zM32 192v224q0 13 9.5 22.5T64 448h32V160H64q-13 0-22.5 9T32 192zm160-96v32h128V96q0-14-9-23t-23-9h-64q-13 0-22.5 9T192 96z";
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
  var _default = "SAP-icons-v4/suitcase";
  _exports.default = _default;
});