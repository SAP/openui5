sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "gantt-bars";
  const pathData = "M32 192V64q0-13 9.5-22.5T64 32h64V0h32v32h192V0h32v32h64q14 0 23 9.5t9 22.5v256h-32V128H64v64H32zm32 96v192h384v-64h32v64q0 14-9 23t-23 9H64q-13 0-22.5-9T32 480V288h32zm80 80q0-6 4.5-11t11.5-5h352v32h-96l-47 64-49-64h-64l-47 65q-4-4-14.5-16t-22-25.5-20-25T144 368zM0 224h288q7 0 11.5 5t4.5 11q0 4-10 16.5T272 283q-7 8-15 17t-16 19l-49-63H0v-32zM384 96V64h-32v32h32zm-224 0V64h-32v32h32z";
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
  var _default = "SAP-icons-v4/gantt-bars";
  _exports.default = _default;
});