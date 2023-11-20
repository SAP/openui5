sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "accelerated";
  const pathData = "M32 64q0-13 9-22.5T64 32h64V0h32v32h192V0h32v32h64q14 0 23 9.5t9 22.5v416q0 14-9 23t-23 9H64q-14 0-23-9t-9-23V64zm32 64v352h384V128H64zm64 240q0-7 5-11.5t11-4.5h256q16 0 16 16 0 6-4.5 11t-11.5 5H144q-6 0-11-5t-5-11zm-16-80h160q16 0 16 16 0 6-4.5 11t-11.5 5H112q-6 0-11-5t-5-11q0-7 5-11.5t11-4.5zm112-48q0-7 5-11.5t11-4.5h128q16 0 16 16 0 6-4.5 11t-11.5 5H240q-6 0-11-5t-5-11zM352 64v32h32V64h-32zm-224 0v32h32V64h-32z";
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
  var _default = "SAP-icons-v4/accelerated";
  _exports.default = _default;
});