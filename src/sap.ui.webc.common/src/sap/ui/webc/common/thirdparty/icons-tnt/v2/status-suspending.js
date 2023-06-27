sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "status-suspending";
  const pathData = "M464 224q-20-15-44.5-23.5T368 192q-17 0-32 3V96h-64v128q-29 22-46.5 55.5T208 352q0 27 8.5 51.5T240 448H48q-14 0-23-9t-9-23V32q0-14 9-23t23-9h384q14 0 23 9t9 23v192zM144 96v256h64V96h-64zm208 288v-80q0-16 16-16t16 16v48h32q16 0 16 16t-16 16h-64zm17 96q-27 0-50.5-10.5t-41-28T250 401t-10-49 10-49.5 27.5-41 41-27.5 49.5-10 49 10 40.5 27.5 28 41T496 353q0 26-10 49t-27 40.5-40.5 27.5-49.5 10zm0-224q-41 0-69 27.5T272 352q0 19 7.5 36.5t20 31 30 21T368 448q40 0 68-27.5t28-68.5-27.5-68.5T369 256z";
  _exports.pathData = pathData;
  const ltr = false;
  _exports.ltr = ltr;
  const accData = null;
  _exports.accData = accData;
  const collection = "tnt-v2";
  const packageName = "@ui5/webcomponents-icons-tnt";
  (0, _Icons.registerIcon)(name, {
    pathData,
    ltr,
    collection,
    packageName
  });
  var _default = "tnt-v2/status-suspending";
  _exports.default = _default;
});