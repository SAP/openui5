sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "hello-world";
  const pathData = "M256 0q53 0 99.5 20T437 74.5t55 80.5 20 99-20.5 100-55.5 82-81.5 55.5T256 512H26q-11 0-18.5-7.5T0 486q0-8 4-13l42-70Q0 339 0 257q0-53 20-100t55-82 81.5-55T256 0zm146 400q29-29 44-66t15-78q0-34-10.5-65t-29-56.5T377 90t-57-29v41q0 11-7 18.5t-18 7.5h-71v38q0 11-7 18.5t-18 7.5h-42l54 64h84q11 0 18 7.5t7 18.5v70h7q25 0 45 13.5t30 34.5zM92 379q7 8 9 13t2 10q0 8-4 13l-28 46h154v-55q-26-8-40.5-28.5T167 331L56 212q-5 23-5 44 0 36 11 68t30 55z";
  _exports.pathData = pathData;
  const ltr = false;
  _exports.ltr = ltr;
  const accData = null;
  _exports.accData = accData;
  const collection = "SAP-icons-v5";
  const packageName = "@ui5/webcomponents-icons";
  (0, _Icons.registerIcon)(name, {
    pathData,
    ltr,
    collection,
    packageName
  });
  var _default = "SAP-icons-v5/hello-world";
  _exports.default = _default;
});