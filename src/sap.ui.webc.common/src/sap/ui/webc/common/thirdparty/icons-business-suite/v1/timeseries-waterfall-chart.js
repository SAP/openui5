sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "timeseries-waterfall-chart";
  const pathData = "M32 0h64v432H32V0zm128 0h64v160h-64V0zm258 0c53 0 94 38 94 97 0 55-41 95-94 95-56 0-98-42-98-95 0-59 42-97 98-97zm-2 168c39 0 73-34 73-71 0-41-34-73-73-73-19 0-36 7-50 21-15 13-22 30-22 52 0 37 35 71 72 71zm-23-52V56h24v36h48v24h-72zm-105 76h64v144h-64V192zm128 240V272h64v160h-64zm96 80H0v-32h512v32z";
  _exports.pathData = pathData;
  const ltr = false;
  _exports.ltr = ltr;
  const accData = null;
  _exports.accData = accData;
  const collection = "business-suite-v1";
  const packageName = "@ui5/webcomponents-icons-business-suite";
  (0, _Icons.registerIcon)(name, {
    pathData,
    ltr,
    collection,
    packageName
  });
  var _default = "business-suite-v1/timeseries-waterfall-chart";
  _exports.default = _default;
});