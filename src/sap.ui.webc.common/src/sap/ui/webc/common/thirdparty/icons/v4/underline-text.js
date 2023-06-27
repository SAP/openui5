sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "underline-text";
  const pathData = "M128 32h32v208q0 33 23.5 56.5T240 320h32q34 0 57-23.5t23-56.5V32h32v208q0 23-9 43.5T351 319t-35.5 24-43.5 9h-32q-23 0-43.5-9T161 319t-24-35.5-9-43.5V32zM80 448h352q6 0 11 5t5 11q0 16-16 16H80q-16 0-16-16t16-16z";
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
  var _default = "SAP-icons-v4/underline-text";
  _exports.default = _default;
});