sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "letter";
  const pathData = "M480 96H32v320h448V96zM176 288q16 0 16 16t-16 16h-64q-6 0-11-5t-5-11q0-16 16-16h64zm96-64q16 0 16 16t-16 16H112q-6 0-11-5t-5-11q0-16 16-16h160zM480 64q14 0 23 9t9 23v320q0 13-9 22-9 10-23 10H32q-13 0-22-10-10-9-10-22V96q0-14 10-23 9-9 22-9h448zm-32 112q0 16-16 16h-32q-6 0-11-5t-5-11v-32q0-16 16-16h32q16 0 16 16v32z";
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
  var _default = "SAP-icons-v4/letter";
  _exports.default = _default;
});