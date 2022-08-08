sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "cursor-arrow";
  const pathData = "M471.5 380q9 9 9 22.5t-9 22.5l-46 45q-9 10-22 10-14 0-23-10l-124-124v61q0 17-12 29t-29 12q-11 0-20.5-5.5T180.5 427l-2-4q-31-79-59-150-12-30-24.5-61.5t-24-61T49.5 96t-16-43q-1-3-1-6 0-4 4-9.5t12-5.5q3 0 5 1 18 6 43 16t54 21 61 23 62 24q70 27 149 58l2 1h1q13 7 18 18t5 20q0 5-1 10-4 14-15 23t-25 9h-61zm-23 23l-179-179h138q6 0 9-8v-3q0-6-5-8-1 0-18.5-7t-45.5-18-63-25q-18-6-36-13l-74-29q-18-7-35-14-36-13-64-24 11 28 25 63l57 145q14 36 25 64t18 45.5 7 18.5h1q2 5 7 5 9 0 9-9V269l179 179z";
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
  var _default = "cursor-arrow";
  _exports.default = _default;
});