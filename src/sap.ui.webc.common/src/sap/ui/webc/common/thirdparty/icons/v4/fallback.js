sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "fallback";
  const pathData = "M224 288q0-14 9.5-23t22.5-9h224q14 0 23 9t9 23v191q0 13-9 22.5t-23 9.5H256q-13 0-22.5-9.5T224 479V288zM4 47q3-6 9.5-11T32 31h180q7 0 12 5l24 27h232q11 0 18 5t10 11q4 7 4 16v97h-32v-65q-2-13-10-22.5T448 95H231q-7 0-12-5l-22-22q-5-5-12-5H64q-12 0-18.5 5T36 79q-4 7-4 16v320q0 13 5 19t11 9q7 4 16 4h96v32H32q-9 0-16-4-6-3-11-9.5T0 447V63q0-9 4-16z";
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
  var _default = "SAP-icons-v4/fallback";
  _exports.default = _default;
});