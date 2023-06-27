sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "attachment-text-file";
  const pathData = "M48 480V128L176 0h256q14 0 23 9.5t9 22.5v448q0 14-8.5 23t-22.5 9H81q-14 0-23.5-9T48 480zm385 0l-1-448H208v96q0 14-9 23t-23 9H80v320h353zm-65-288v32h-96v192h-32V224h-96v-32h224z";
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
  var _default = "SAP-icons-v4/attachment-text-file";
  _exports.default = _default;
});