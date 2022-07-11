sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "trip-report";
  const pathData = "M0 192q0-26 19-45t45-19h96V96q0-26 19-45t45-19h64q27 0 45.5 19T352 96v32h96q27 0 45.5 19t18.5 45v224q0 26-18.5 45T448 480H64q-26 0-45-19T0 416V192zm320-64V96q0-14-9-23t-23-9h-64q-13 0-22.5 9T192 96v32h128zM32 192v224q0 14 9.5 23t22.5 9h384q14 0 23-9t9-23V192q0-14-9-23t-23-9H64q-13 0-22.5 9T32 192zm224-2q27 0 51 10t41 32l-87 53zm-33 19l11 112 60 71q-16 10-36 12-42 0-73.5-21.5T148 316q-1-6-1-12 0-31 20-58.5t56-36.5zm52 108l82-53q8 15 9 33v9q0 22-9 43.5T330 388z";
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
  var _default = "trip-report";
  _exports.default = _default;
});