sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "pull-down";
  const pathData = "M42 261q9-9 22-9 14 0 23 9l139 141q0-2-.5-7.5T225 369t-.5-61.5T224 192h64l-1 210 139-141q9-9 22-9 14 0 23 9 9 10 9 23t-9 22L279 503q-2 0-5 3-2 1-3.5 2t-3.5 2l-5 1q-1 1-6 1-1 0-3.5-.5L245 510q-2-1-2.5-1.5T240 507t-2.5-1.5-2.5-1.5l-1-1h-1L42 306q-10-9-10-22t10-23zm182-133h64v32h-64v-32zm0-64h64v32h-64V64zm64-64v32h-64V0h64z";
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
  var _default = "SAP-icons-v4/pull-down";
  _exports.default = _default;
});