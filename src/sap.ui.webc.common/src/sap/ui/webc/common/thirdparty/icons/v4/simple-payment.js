sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "simple-payment";
  const pathData = "M64 32q0-14 9-23t23-9h320q14 0 23 9t9 23v448q0 13-9 22.5t-23 9.5H96q-14 0-23-9.5T64 480V32zm32 448h320V32H96v448zm76-163l41-5q3 14 12 25t19 15v-73q-32-11-51.5-32.5T173 202q0-12 5-25t14.5-24 22.5-18.5 29-8.5v-21h25v21q58 4 70 62l-36 6q-2-12-11-20t-23-9v76q42 9 59 31t17 43q0 31-20.5 53.5T269 393v33h-25v-32q-26-1-47-20t-25-57zm97 39q14-4 23.5-14.5T302 319q0-25-33-35v72zm-25-128v-64q-11 4-18 13t-7 19q0 20 25 32z";
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
  var _default = "SAP-icons-v4/simple-payment";
  _exports.default = _default;
});