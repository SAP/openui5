sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "folder-blank";
  const pathData = "M0 448V64q0-14 9-23t23-9h180q7 0 12 5l19 22q5 5 12 5h225q14 0 23 9t9 23v352q0 14-9 23t-23 9H32q-14 0-23-9t-9-23zm48-1h416q16 0 16-16V112q0-16-16-16H237q-7 0-12-5l-19-22q-5-5-12-5H48q-16 0-16 16v351q0 16 16 16z";
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
  var _default = "SAP-icons-v4/folder-blank";
  _exports.default = _default;
});