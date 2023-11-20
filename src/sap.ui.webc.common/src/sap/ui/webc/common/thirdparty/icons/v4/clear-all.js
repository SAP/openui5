sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "clear-all";
  const pathData = "M432 449V288h32v161q0 13-8.5 22.5T433 481H48q-13 0-22.5-9.5T16 449V64q0-13 9-22t23-9h193v32H48v384h384zm64-385l-66 63 66 66-32 32-63-66-65 66-33-32 66-66-66-63 33-32 65 64 63-64z";
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
  var _default = "SAP-icons-v4/clear-all";
  _exports.default = _default;
});