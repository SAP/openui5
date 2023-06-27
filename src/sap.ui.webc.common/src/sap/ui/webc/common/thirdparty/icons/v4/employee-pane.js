sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "employee-pane";
  const pathData = "M32 448V64q0-14 9.5-23T64 32h384q14 0 23 9t9 23v384q0 14-9 23t-23 9H64q-13 0-22.5-9T32 448zm64 0v-32q0-26 7-49.5t22.5-41 40-27.5 58.5-10h64q35 0 59.5 10t39.5 27.5 22 41 7 49.5v32h32V64H64v384h32zM256 96q40 0 68 28t28 68-28 68-68 28-68-28-28-68 28-68 68-28zM128 448h256v-32q0-96-96-96h-64q-96 0-96 96v32zm64-256q0 27 19 45.5t45 18.5 45-18.5 19-45.5q0-26-19-45t-45-19-45 19-19 45zm64 192h96v32h-96v-32z";
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
  var _default = "SAP-icons-v4/employee-pane";
  _exports.default = _default;
});