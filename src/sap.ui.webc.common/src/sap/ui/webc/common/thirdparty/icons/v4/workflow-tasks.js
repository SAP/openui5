sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "workflow-tasks";
  const pathData = "M32 480V64q0-13 9-22.5T64 32h64V0h32v32h192V0h32v32h64q14 0 23 9.5t9 22.5v416q0 14-9 23t-23 9H64q-14 0-23-9t-9-23zM352 64v32h32V64h-32zm-224 0v32h32V64h-32zM64 480h384V128H64v352zm63-176q0-16 16-16h191l-75-68q-5-6-5-12t5-11 11-5 11 5l92 83q9 10 9 23t-9 23l-92 86q-5 5-11 5-3 0-11-5-5-6-5-12t5-11l75-69H143q-16 0-16-16z";
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
  var _default = "workflow-tasks";
  _exports.default = _default;
});