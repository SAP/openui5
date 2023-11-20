sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "timesheet";
  const pathData = "M352 353h32v127q0 14-9 23t-23 9H32q-14 0-23-9t-9-23V128L128 0h224q13 0 22.5 9t9.5 23H160v96q0 14-9.5 23t-23.5 9H32v320h320V353zm80-129q16 0 16-16t-16-16h-33v-48q0-16-16-16t-16 16v80h65zm-48 96q27 0 50-10t40.5-27.5 27.5-41 10-49.5q0-27-10-50t-27.5-40.5T434 74t-50-10-50 10-40.5 27.5T266 142t-10 50q0 26 10 49.5t27.5 41T334 310t50 10zm0-224q40 0 68 28t28 68-28 68-68 28-68-28-28-68 28-68 68-28z";
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
  var _default = "SAP-icons-v4/timesheet";
  _exports.default = _default;
});