sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "bar-code";
  const pathData = "M454 32q24 0 41 17t17 41v76q0 11-7.5 18.5T486 192t-18-7.5-7-18.5V90q0-7-7-7h-76q-11 0-18.5-7T352 58t7.5-18.5T378 32h76zM26 192q-11 0-18.5-7.5T0 166V90q0-24 17-41t41-17h76q11 0 18.5 7.5T160 58t-7.5 18-18.5 7H58q-7 0-7 7v76q0 11-7 18.5T26 192zm198-64h64v256h-64V128zm-96 256H96V128h32v256zm32-256h32v256h-32V128zm256 256h-48V128h48v256zm-64 0h-32V128h32v256zm134-64q11 0 18.5 7.5T512 346v76q0 24-17 41t-41 17h-76q-11 0-18.5-7.5T352 454t7.5-18 18.5-7h76q7 0 7-7v-76q0-11 7-18.5t18-7.5zM134 429q11 0 18.5 7t7.5 18-7.5 18.5T134 480H58q-24 0-41-17T0 422v-76q0-11 7.5-18.5T26 320t18 7.5 7 18.5v76q0 7 7 7h76z";
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
  var _default = "SAP-icons-v5/bar-code";
  _exports.default = _default;
});