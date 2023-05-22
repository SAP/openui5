sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "date-time";
  const pathData = "M352 192q33 0 62 12.5t51 34.5 34.5 51 12.5 62-12.5 62-34.5 51-51 34.5-62 12.5-62-12.5-51-34.5-34.5-51-12.5-62 12.5-62 34.5-51 51-34.5 62-12.5zM32 32h64V0h32v32h192V0h32v32h64q14 0 23 9t9 23v96h-32v-32H32v352h128v32H32q-14 0-23-9t-9-23V64q0-14 9-23t23-9zm192 320q0 27 10 50t27.5 40.5T302 470t50 10 50-10 40.5-27.5T470 402t10-50-10-50-27.5-40.5T402 234t-50-10-50 10-40.5 27.5T234 302t-10 50zm127-64q16 0 16 16v48h49q16 0 16 16 0 6-4.5 11t-11.5 5h-65q-7 0-11.5-5t-4.5-11v-64q0-16 16-16zm1-192V64h-32v32h32zM96 64v32h32V64H96z";
  _exports.pathData = pathData;
  const ltr = true;
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
  var _default = "SAP-icons-v4/date-time";
  _exports.default = _default;
});