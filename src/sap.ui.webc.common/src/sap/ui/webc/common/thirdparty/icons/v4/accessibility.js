sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "accessibility";
  const pathData = "M256 147q-14 0-23-9.5t-9-22.5q0-14 9-23t23-9 23 9 9 23q0 13-9 22.5t-23 9.5zm86-2q10-6 16-6 11 0 18.5 7.5T384 165q0 12-11.5 20.5t-27.5 14-32 8.5-25 5v43l49 125q2 3 2 9 0 11-7.5 18.5T314 416q-18 0-24-16l-32-80h-5l-31 80q-6 16-24 16-10 0-17.5-7.5T173 390q0-6 2-9l49-125v-43q-9-1-25-4t-31.5-9-27.5-14.5-12-20.5q0-11 7.5-18.5T154 139q6 0 15 5 17 9 40.5 14.5T256 164q24 0 46-4.5t40-14.5zM256 0q53 0 99.5 20T437 75t55 81.5 20 99.5-20 99.5-55 81.5-81.5 55-99.5 20-99.5-20T75 437t-55-81.5T0 256t20-99.5T75 75t81.5-55T256 0zm0 480q47 0 87.5-17.5t71-48 48-71.5 17.5-87q0-47-17.5-87.5t-48-71-71-48T256 32q-46 0-87 17.5t-71.5 48-48 71T32 256q0 46 17.5 87t48 71.5 71.5 48 87 17.5z";
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
  var _default = "SAP-icons-v4/accessibility";
  _exports.default = _default;
});