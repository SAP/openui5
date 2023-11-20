sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "browse-folder";
  const pathData = "M0 64q0-9 4-16 3-6 9.5-11T32 32h180q7 0 12 5l24 27h232q11 0 18 5t10 11q4 7 4 16v128h-32v-96q-2-13-10-22.5T448 96H231q-7 0-12-5l-22-22q-5-5-12-5H64q-12 0-18.5 5T36 80q-4 7-4 16v320q0 13 5 19t11 9q7 4 16 4h160v32H32q-9 0-16-4-6-3-11-9.5T0 448V64zm352 192q40 0 68 28t28 68q0 29-18 55l82 82-22 23-82-82q-25 18-56 18-40 0-68-28t-28-68 28-68 68-28zm-64 96q0 26 19 45t45 19 45-19 19-45q0-27-19-45.5T352 288t-45 18.5-19 45.5z";
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
  var _default = "SAP-icons-v4/browse-folder";
  _exports.default = _default;
});